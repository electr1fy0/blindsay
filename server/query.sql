
-- name: GetUser :one
select * from users
where id = $1 limit 1;


-- name: GetMessages :many
select * from messages
where recepient_id = $1
limit 10;

-- name: DeleteMessage :exec
delete from messages
where id = $1;
