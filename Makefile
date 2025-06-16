include ./fullstack/.env
export

COMPOSE_BAKE=true

LANG=ru_RU.UTF-8


all: run clean # restore test clean run


run:
	@docker compose build
	@docker compose up -d
	@docker ps


runner:
	@docker compose up


start:
	@docker compose up -d


stop:
	@docker compose down


clean:
	@docker system prune -f
	@docker system prune -f --volumes


# logs:
# 	@sudo htpasswd -b .htpasswd $(ADMIN_USER) $(ADMIN_PASSW)
# 	@goaccess ./log/nginx/access.log -o ./log/report/report.html --log-format COMBINED --html-report-title "Статистика"


up:
	@sudo dnf --refresh update && sudo dnf upgrade

# restore:
# 	@cat $(LOCAL_DUMP_PATH) | docker exec -i full_db_postgres psql -U $(NEXT_PUBLIC_DB_USER_DEV) -d $(NEXT_PUBLIC_DB_NAME_DEV) < $(LOCAL_DUMP_PATH)
# 	@echo "Restored All! `date +%F--%H-%M`"


# restore_data:
# 	@cat $(LOCAL_DUMP_PATH) | docker exec -i full_db_postgres psql --data-only -U $(NEXT_PUBLIC_DB_USER_DEV) -d $(NEXT_PUBLIC_DB_NAME_DEV) < $(LOCAL_DUMP_PATH)
# 	@echo "Restored Data! `date +%F--%H-%M`"


# backup:
# 	@docker exec -i full_db_postgres pg_dump --column-inserts --username $(NEXT_PUBLIC_DB_USER_DEV) $(NEXT_PUBLIC_DB_NAME_DEV) > $(LOCAL_DUMP_PATH)
# 	@echo "Backed up All! `date +%F--%H-%M`"


# backup_data:
# 	@docker exec -i full_db_postgres pg_dump --data-only --column-inserts --username $(NEXT_PUBLIC_DB_USER_DEV) $(NEXT_PUBLIC_DB_NAME_DEV) > $(LOCAL_DUMP_PATH)
# 	@echo "Backed up Data! `date +%F--%H-%M`
