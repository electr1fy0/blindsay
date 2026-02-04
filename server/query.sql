
-- name: GetUserByUsername :one
select * from users
where username = $1 limit 1;


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
