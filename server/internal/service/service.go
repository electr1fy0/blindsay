package service

import (
	"context"
	"server/internal/repository"
	"server/internal/types"

	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	Repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo}
}

func (s *Service) GetUserByUsername(ctx context.Context, username string) (types.User, error) {
	return s.Repo.GetUserByUsername(ctx, username)
}

func (s *Service) Signup(ctx context.Context, u types.SignupRequest) error {
	hash, _ := bcrypt.GenerateFromPassword([]byte(u.Password), 10)

	return s.Repo.CreateUser(ctx, u, hash)
}

func (s *Service) Signin(ctx context.Context, u types.SigninRequest) error {
	dbUser, err := s.Repo.GetUserByUsername(ctx, u.Username)
	if err != nil {
		return err
	}

	return bcrypt.CompareHashAndPassword([]byte(dbUser.PasswordHash), []byte(u.Password))
}

func (s *Service) CreateMessage(ctx context.Context, m types.Message) error {
	return s.Repo.CreateMessage(ctx, m)
}
