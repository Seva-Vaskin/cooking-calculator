create table if not exists foodstuff
(
    name          varchar not null primary key,
    proteins      real    not null,
    fats          real    not null,
    carbohydrates real    not null
);