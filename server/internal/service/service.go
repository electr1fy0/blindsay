package service

import (
	"context"
	"fmt"
	"server/internal/database"
	"server/internal/types"
	"time"

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
	// Verify email flow state
	flow, err := s.Q.GetAuthFlow(ctx, u.Email)
	if err != nil {
		return err // or "verification required"
	}
	// Check if state indicates verification passed (password_setup or profile_setup)
	if flow.State != database.AuthStatePasswordSetup && flow.State != database.AuthStateProfileSetup {
		return fmt.Errorf("email not verified")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), 10)
	if err != nil {
		return err
	}

	err = s.Q.CreateUser(ctx, database.CreateUserParams{
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: string(hash),
	})
	if err != nil {
		return err
	}
	
	// Mark flow as done
	_ = s.Q.UpdateAuthFlowState(ctx, database.UpdateAuthFlowStateParams{
		ID: flow.ID,
		State: database.AuthStateDone,
	})
	
	return nil
}

func (s *Service) Signin(ctx context.Context, u types.SigninRequest) error {
	dbUser, err := s.Q.GetUserByUsernameOrEmail(ctx, u.Username)
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

func (s *Service) CheckEmail(ctx context.Context, email string) (types.AuthCheckResponse, error) {
	_, err := s.Q.GetUserByEmail(ctx, email)
	if err == nil {
		return types.AuthCheckResponse{Exists: true, State: "password_login"}, nil
	}

	// Assuming err is "no rows" or similar. In a real app check specific error.
	// User not found, so we initiate signup flow (save email).
	
	// Create auth flow entry
	// Mock verification code
	code := "123456"
	expiresAt := time.Now().Add(10 * time.Minute)

	_, err = s.Q.CreateAuthFlow(ctx, database.CreateAuthFlowParams{
		Email:            email,
		State:            database.AuthStateEmailVerification,
		VerificationCode: pgtype.Text{String: code, Valid: true},
		ExpiresAt:        pgtype.Timestamptz{Time: expiresAt, Valid: true},
	})
	if err != nil {
		return types.AuthCheckResponse{}, err
	}

	return types.AuthCheckResponse{Exists: false, State: "email_verification"}, nil
}

func (s *Service) VerifyCode(ctx context.Context, email, code string) (bool, error) {
	flow, err := s.Q.GetAuthFlow(ctx, email)
	if err != nil {
		return false, err
	}

	if flow.VerificationCode.String == code {
		// Update state to password_setup
		err = s.Q.UpdateAuthFlowState(ctx, database.UpdateAuthFlowStateParams{
			ID:    flow.ID,
			State: database.AuthStatePasswordSetup,
		})
		if err != nil {
			return false, err
		}
		return true, nil
	}
	return false, nil
}
