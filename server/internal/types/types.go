package types

import (
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type APIHandler struct {
	DB *pgxpool.Pool
}

type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash"`
	IsActive     bool      `json:"is_active"`
	IsVerified   bool      `json:"is_verified"`
	CreatedAt    time.Time `json:"created_at"`
}

type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SigninRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Message struct {
	RecipientID int64  `json:"recipient_id"`
	Content     string `json:"content"`
}

type Reply struct {
	Content    string `json:"content"`
	QuestionID string `json:"questionId"`
}
