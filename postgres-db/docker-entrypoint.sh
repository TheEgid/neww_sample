#!/usr/bin/env bash
enset -Eeuo pipefail

file_env() {
    local var="$1"
    local fileVar="${var}_FILE"
    local def="${2:-}"
    if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
        printf >&2 'error: both %s and %s are set (but are exclusive)\n' "$var" "$fileVar"
        exit 1
    fi
    local val="$def"
    if [ "${!var:-}" ]; then
        val="${!var}"
    elif [ "${!fileVar:-}" ]; then
        val="$(< "${!fileVar}")"
    fi
    export "$var"="$val"
    unset "$fileVar"
}

_is_sourced() {
    [ "${#FUNCNAME[@]}" -ge 2 ] &&
    [ "${FUNCNAME[0]}" = '_is_sourced' ] &&
    [ "${FUNCNAME[1]}" = 'source' ]
}

docker_create_db_directories() {
    local user; user="$(id -u)"

    mkdir -p "$PGDATA"
    chmod 00700 "$PGDATA" || :

    mkdir -p /var/run/postgresql || :
    chmod 03775 /var/run/postgresql || :

    if [ -n "${POSTGRES_INITDB_WALDIR:-}" ]; then
        mkdir -p "$POSTGRES_INITDB_WALDIR"
        if [ ! -d "$POSTGRES_INITDB_WALDIR" ]; then
            echo >&2 "Error: Failed to create WAL directory $POSTGRES_INITDB_WALDIR"
            exit 1
        fi
        if [ "$user" = '0' ]; then
            find "$POSTGRES_INITDB_WALDIR" \! -user postgres -exec chown postgres '{}' +
        fi
        chmod 700 "$POSTGRES_INITDB_WALDIR" || :
    fi

    if [ "$user" = '0' ]; then
        find "$PGDATA" \! -user postgres -exec chown postgres '{}' +
        find /var/run/postgresql \! -user postgres -exec chown postgres '{}' +
    fi
}

docker_init_database_dir() {
    local uid; uid="$(id -u)"
    if ! getent passwd "$uid" &>/dev/null; then
        local wrapper
        for wrapper in {/usr,}/lib{/*,}/libnss_wrapper.so; do
            if [ -s "$wrapper" ]; then
                NSS_WRAPPER_PASSWD="$(mktemp)"
                NSS_WRAPPER_GROUP="$(mktemp)"
                export LD_PRELOAD="$wrapper" NSS_WRAPPER_PASSWD NSS_WRAPPER_GROUP
                local gid; gid="$(id -g)"
                printf 'postgres:x:%s:%s:PostgreSQL:%s:/bin/false\n' "$uid" "$gid" "$PGDATA" >"$NSS_WRAPPER_PASSWD"
                printf 'postgres:x:%s:\n' "$gid" >"$NSS_WRAPPER_GROUP"
                break
            fi
        done
    fi

    local initdb_args=()
    if [ -n "${POSTGRES_INITDB_WALDIR:-}" ]; then
        initdb_args+=(--waldir "$POSTGRES_INITDB_WALDIR")
    fi

    local pwfile
    pwfile="$(mktemp)"
    # Записываем пароль без перевода строки
    printf "%s" "$POSTGRES_PASSWORD" > "$pwfile"
    initdb_args+=(
        --username="$POSTGRES_USER"
        --pwfile="$pwfile"
    )

    if [ -n "${POSTGRES_INITDB_ARGS:-}" ]; then
        # Безопасное добавление аргументов
        while IFS= read -r -d '' arg; do
            initdb_args+=("$arg")
        done < <(xargs -n1 printf '%s\0' <<<"$POSTGRES_INITDB_ARGS")
    fi

    # Выполняем initdb
    initdb "${initdb_args[@]}"
    rm -f "$pwfile"

    if [[ -n "${LD_PRELOAD:-}" && "${LD_PRELOAD}" == */libnss_wrapper.so ]]; then
        rm -f "$NSS_WRAPPER_PASSWD" "$NSS_WRAPPER_GROUP"
        unset LD_PRELOAD NSS_WRAPPER_PASSWD NSS_WRAPPER_GROUP
    fi
}

docker_verify_minimum_env() {
    # Исправлена проверка длины пароля
    if [ -n "${POSTGRES_PASSWORD:-}" ] && [ "${#POSTGRES_PASSWORD}" -ge 100 ]; then
        echo "WARNING: POSTGRES_PASSWORD is 100+ characters. This will not work well with PGPASSWORD via psql." >&2
    fi

    if [ -z "${POSTGRES_PASSWORD:-}" ] && [ "${POSTGRES_HOST_AUTH_METHOD:-}" != "trust" ]; then
        echo "ERROR: POSTGRES_PASSWORD not set and POSTGRES_HOST_AUTH_METHOD != trust. Initialization aborted." >&2
        exit 1
    fi

    if [ "${POSTGRES_HOST_AUTH_METHOD:-}" = "trust" ]; then
        echo "WARNING: PostgreSQL auth method is set to trust. Insecure for production." >&2
    fi
}

docker_process_sql() {
    local query_runner=(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --no-password --no-psqlrc)
    if [ -n "${POSTGRES_DB:-}" ]; then
        query_runner+=(--dbname "$POSTGRES_DB")
    fi
    PGHOST= PGHOSTADDR= "${query_runner[@]}" "$@"
}

docker_process_init_files() {
    local psql=(docker_process_sql)
    printf '\n'
    local f
    for f; do
        case "$f" in
        *.sh)
            if [ -x "$f" ]; then
                echo "$0: running $f"
                "$f"
            else
                echo "$0: sourcing $f"
                . "$f"
            fi
            ;;
        *.sql)    echo "$0: running $f"; docker_process_sql -f "$f"; echo ;;
        *.sql.gz) echo "$0: running $f"; gunzip -c "$f" | docker_process_sql; echo ;;
        *.sql.xz) echo "$0: running $f"; xzcat "$f" | docker_process_sql; echo ;;
        *.sql.zst) echo "$0: running $f"; zstd -dc "$f" | docker_process_sql; echo ;;
        *)        echo "$0: ignoring $f" ;;
        esac
    done
}

docker_setup_db() {
    local user_db_exists
    # Исправлен синтаксис SQL запроса
    user_db_exists="$(docker_process_sql --dbname postgres --tuples-only <<EOSQL
        SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_USER}';
EOSQL
    )"
    if [ -z "$user_db_exists" ]; then
        echo "Creating user database: \"$POSTGRES_USER\""
        docker_process_sql --dbname postgres <<EOSQL
            CREATE DATABASE "${POSTGRES_USER}";
EOSQL
    fi

    if [ -n "${POSTGRES_DB:-}" ] && [ "$POSTGRES_DB" != "$POSTGRES_USER" ]; then
        local target_db_exists
        # Исправлен синтаксис SQL запроса
        target_db_exists="$(docker_process_sql --dbname postgres --tuples-only <<EOSQL
            SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}';
EOSQL
        )"
        if [ -z "$target_db_exists" ]; then
            echo "Creating target database: \"$POSTGRES_DB\""
            docker_process_sql --dbname postgres <<EOSQL
                CREATE DATABASE "${POSTGRES_DB}";
EOSQL
        fi
    fi
}

docker_setup_env() {
    file_env 'POSTGRES_PASSWORD'
    file_env 'POSTGRES_USER' "${POSTGRES_USER:-postgres}"
    file_env 'POSTGRES_DB' "${POSTGRES_DB:-$POSTGRES_USER}"
    file_env 'POSTGRES_INITDB_ARGS'
    : "${POSTGRES_HOST_AUTH_METHOD:=}"

    DATABASE_ALREADY_EXISTS=""

    if [ -s "$PGDATA/PG_VERSION" ]; then
        DATABASE_ALREADY_EXISTS='true'
    fi
}

pg_setup_hba_conf() {
    if [ "$1" = 'postgres' ]; then shift; fi
    local auth
    auth="$(postgres -C password_encryption "$@")"
    : "${POSTGRES_HOST_AUTH_METHOD:=$auth}"

    {
        echo
        [ "$POSTGRES_HOST_AUTH_METHOD" = "trust" ] && echo "# WARNING: trust is enabled"
        printf 'host all all 127.0.0.1/32 %s\n' "$POSTGRES_HOST_AUTH_METHOD"
        printf 'host all all ::1/128 %s\n' "$POSTGRES_HOST_AUTH_METHOD"
        printf 'host all all 0.0.0.0/0 %s\n' "$POSTGRES_HOST_AUTH_METHOD"
    } >>"$PGDATA/pg_hba.conf"
}

docker_temp_server_start() {
    if [ "$1" = 'postgres' ]; then shift; fi
    set -- "$@" -c listen_addresses='' -p "${PGPORT:-5432}"
    PGUSER="${PGUSER:-$POSTGRES_USER}" pg_ctl -D "$PGDATA" -o "$(printf '%q ' "$@")" -w start
}

docker_temp_server_stop() {
    PGUSER="${PGUSER:-postgres}" pg_ctl -D "$PGDATA" -m fast -w stop
}

_pg_want_help() {
    local arg
    for arg; do
        case "$arg" in
        -'?' | --help | --describe-config | -V | --version) return 0 ;;
        esac
    done
    return 1
}

_main() {
    if [ "${1:0:1}" = '-' ]; then
        set -- postgres "$@"
    fi

    if [ "$1" = 'postgres' ] && ! _pg_want_help "$@"; then
        docker_setup_env
        docker_create_db_directories

        if [ "$(id -u)" = '0' ]; then
            exec gosu postgres "$BASH_SOURCE" "$@"
        fi

        if [ -z "${DATABASE_ALREADY_EXISTS:-}" ]; then
            docker_verify_minimum_env
            ls /docker-entrypoint-initdb.d/ >/dev/null
            docker_init_database_dir
            pg_setup_hba_conf "$@"

            export PGPASSWORD="${PGPASSWORD:-$POSTGRES_PASSWORD}"
            docker_temp_server_start "$@"

            docker_setup_db
            docker_process_init_files /docker-entrypoint-initdb.d/*

            docker_temp_server_stop
            unset PGPASSWORD

            echo "PostgreSQL init process complete; ready for start up."
        else
            echo "PostgreSQL Database directory appears to contain a database; Skipping initialization"
        fi
    fi

    exec "$@"
}

if ! _is_sourced; then
    _main "$@"
fi
