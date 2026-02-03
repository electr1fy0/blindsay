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

func (r *Repository) GetUserByUsername(ctx context.Context, username string) (types.User, error) {
	u, err := r.Q.GetUserByUsername(ctx, username)
	if err != nil {
		return types.User{}, err
	}

	return types.User{
		ID:           u.ID,
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		IsActive:     u.IsActive,
		IsVerified:   u.IsVerified,
		CreatedAt:    u.CreatedAt.Time,
	}, err
}

func (r *Repository) CreateUser(ctx context.Context, u types.SignupRequest, hash []byte) error {
	return r.Q.CreateUser(ctx, database.CreateUserParams{
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: string(hash),
	})

}

func (r *Repository) CreateMessage(ctx context.Context, m types.Message) error {
	return r.Q.CreateMessage(ctx, database.CreateMessageParams{
		RecipientID: m.RecipientID,
		Content:     m.Content,
	})
}
