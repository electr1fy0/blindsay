package service

import (
	"context"
	"server/internal/database"
	"server/internal/types"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	DB *pgxpool.Pool
	Q  *database.Queries
}

func New(db *pgxpool.Pool) *Service {
	return &Service{
		DB: db,
		Q:  database.New(db),
	}
}

func (s *Service) Close() {
	if s.DB != nil {
		s.DB.Close()
	}
}

func (s *Service) GetUserByUsername(ctx context.Context, username string) (types.User, error) {
	u, err := s.Q.GetUserByUsername(ctx, username)
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

func (s *Service) Signup(ctx context.Context, u types.SignupRequest) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), 10)
	if err != nil {
		return err
	}

	return s.Q.CreateUser(ctx, database.CreateUserParams{
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: string(hash),
	})
}

func (s *Service) Signin(ctx context.Context, u types.SigninRequest) error {
	dbUser, err := s.GetUserByUsername(ctx, u.Username)
	if err != nil {
		return err
	}

	return bcrypt.CompareHashAndPassword([]byte(dbUser.PasswordHash), []byte(u.Password))
}

func (s *Service) CreateMessage(ctx context.Context, m types.Message) error {
	return s.Q.CreateMessage(ctx, database.CreateMessageParams{
		RecipientID: m.RecipientID,
		Content:     m.Content,
	})
}

func (s *Service) GetMessages(ctx context.Context, username string) ([]types.Message, error) {
	u, err := s.Q.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	msgs, err := s.Q.GetMessages(ctx, u.ID)
	var messages []types.Message
	if err != nil {
		return messages, err
	}
	for _, m := range msgs {
		msg := types.Message{
			RecipientID: m.RecipientID,
			Content:     m.MessageContent,
			ID:          m.ID,
			Reply:       m.ReplyContent.String,
		}
		messages = append(messages, msg)
	}
	return messages, nil
}

func (s *Service) CreateReply(ctx context.Context, reply types.Reply) error {
	return s.Q.ReplyToMessage(ctx, database.ReplyToMessageParams{
		ID:    reply.MessageID,
		Reply: pgtype.Text{String: reply.Content, Valid: true},
	})
}
