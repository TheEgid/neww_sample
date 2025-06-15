

# include ./fullstack/.env
export

# LOCAL_DUMP_PATH=_BACKUP/my_backup.sql


# all: run restore test clean run


run:
	@docker-compose build
	@docker-compose up -d
	@docker ps


runner:
	@docker-compose up


stop:
	@docker-compose down


restore:
	@cat $(LOCAL_DUMP_PATH) | docker exec -i full_db_postgres psql -U $(NEXT_PUBLIC_DB_USER_DEV) -d $(NEXT_PUBLIC_DB_NAME_DEV) < $(LOCAL_DUMP_PATH)
	@echo "Restored All! `date +%F--%H-%M`"


restore_data:
	@cat $(LOCAL_DUMP_PATH) | docker exec -i full_db_postgres psql --data-only -U $(NEXT_PUBLIC_DB_USER_DEV) -d $(NEXT_PUBLIC_DB_NAME_DEV) < $(LOCAL_DUMP_PATH)
	@echo "Restored Data! `date +%F--%H-%M`"


backup:
	@docker exec -i full_db_postgres pg_dump --column-inserts --username $(NEXT_PUBLIC_DB_USER_DEV) $(NEXT_PUBLIC_DB_NAME_DEV) > $(LOCAL_DUMP_PATH)
	@echo "Backed up All! `date +%F--%H-%M`"


backup_data:
	@docker exec -i full_db_postgres pg_dump --data-only --column-inserts --username $(NEXT_PUBLIC_DB_USER_DEV) $(NEXT_PUBLIC_DB_NAME_DEV) > $(LOCAL_DUMP_PATH)
	@echo "Backed up Data! `date +%F--%H-%M`
