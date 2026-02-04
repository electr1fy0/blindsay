-- name: GetUserByUsername :one
select * from users
where username = $1 limit 1;

-- name: GetUserByUsernameOrEmail :one
select * from users
where username = $1 or email = $1 limit 1;


-- name: DeleteMessage :exec
delete from messages
where id = $1;


-- name: CreateUser :exec
insert into users (username, email, password_hash)
values ($1, $2, $3);


-- name: CreateMessage :exec
insert into messages (recipient_id, content)
values ($1, $2);

-- name: ReplyToMessage :exec
update messages
set reply = $1
where id = $2;

-- name: GetMessages :many
select
    m.id,
    m.recipient_id,
    m.content as message_content,
    m.reply as reply_content
from messages m
where recipient_id = $1
order by m.id desc
limit 20;

-- name: GetUserByEmail :one
select * from users where email = $1;

-- name: CreateAuthFlow :one
insert into auth_flows (email, state, verification_code, expires_at)
values ($1, $2, $3, $4)
returning *;

-- name: GetAuthFlow :one
select * from auth_flows where email = $1 order by created_at desc limit 1;

-- name: UpdateAuthFlowState :exec
update auth_flows set state = $2 where id = $1;

-- name: UpdateAuthFlowVerification :exec
update auth_flows set verification_code = $2, expires_at = $3 where id = $1;