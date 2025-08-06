create table productos(

    id bigint not null auto_increment,
    codigo varchar(100) not null unique,
    nombre varchar(100) not null,
    precio decimal(10,2) not null,
    stock int not null default 0,

    primary key(id)
);