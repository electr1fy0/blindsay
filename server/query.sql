
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
insert into replies (message_id, author_id, content)
values ($1, $2, $3);

-- name: GetMessages :many
select u.username, m.content from users u
left join messages m
on u.username = m.recipient_id
group by u.username
having username = $1
limit 10;
