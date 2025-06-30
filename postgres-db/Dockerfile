FROM postgres:16.4-bookworm

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

RUN sed -i 's/\r$//' /docker-entrypoint.sh

ENV TZ 'Europe/Moscow'

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["postgres"]
