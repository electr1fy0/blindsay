package repository

import "github.com/jackc/pgx/v5/pgxpool"

type Repository struct {
	DB *pgxpool.Pool
}
