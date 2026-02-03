package repository

import (
	"context"
	"server/internal/database"
	"server/internal/types"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
	Q  *database.Queries
}

func New(db *pgxpool.Pool) *Repository {
	return &Repository{
		DB: db,
		Q:  database.New(db),
	}
}

func (r *Repository) Close() {
	if r.DB != nil {
		r.DB.Close()
	}
}

func (r *Repository) GetUser(ctx context.Context, id int64) (types.User, error) {
	u, err := r.Q.GetUser(ctx, id)

	return types.User{
		ID:         u.ID,
		Username:   u.Username,
		Email:      u.Email,
		IsActive:   u.IsActive,
		IsVerified: u.IsVerified,
		CreatedAt:  u.CreatedAt.Time,
	}, err
}

func (r *Repository) CreateUser(ctx context.Context, u types.SignupRequest, hash []byte) error {
	return r.Q.CreateUser(ctx, database.CreateUserParams{
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: string(hash),
	})

}
