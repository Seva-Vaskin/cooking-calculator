create table if not exists foodstuff (
    name varchar not null primary key,
    protein real not null,
    fats real not null,
    carbohydrates real not null,
    amount int4 not null
);