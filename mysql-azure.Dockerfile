FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=super_bezpieczne_haslo_root
ENV MYSQL_DATABASE=sklep_czesci_db
ENV MYSQL_USER=sklep_user
ENV MYSQL_PASSWORD=bardzo_bezpieczne_haslo_db

# MySQL musi pracować na porcie 80, inaczej Azure go blokuje
EXPOSE 80

CMD ["mysqld", "--user=mysql", "--port=80", "--bind-address=0.0.0.0"]
