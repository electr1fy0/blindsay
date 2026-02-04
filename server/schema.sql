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

CREATE TYPE auth_state AS ENUM (
    'email_entered',
    'password_login',
    'email_verification',
    'password_setup',
    'profile_setup',
    'done'
);

CREATE TABLE auth_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email CITEXT NOT NULL,
    state auth_state NOT NULL,

    verification_code TEXT,
    verification_expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
