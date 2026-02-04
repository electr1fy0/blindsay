
create table users (
    id bigint generated always as identity primary key,

    username citext unique not null,
    email citext not null unique,
    password_hash text not null,

    is_active boolean not null default true,
    is_verified boolean not null default false,

    created_at timestamptz not null default now()
);


create table messages (
    id bigint generated always as identity primary key,
    recipient_id bigint not null
    references users(id)
    on delete cascade,

    content text not null,

    is_read boolean not null default false,
    is_blocked boolean not null default false,

    created_at timestamptz not null default now(),
    reply text
);
