package service

import (
	"context"
	"server/internal/repository"
	"server/internal/types"
)

type Service struct {
	Repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo}
}

func (s *Service) GetUser(ctx context.Context, id int64) (types.User, error) {
	return s.Repo.GetUser(ctx, id)
}
