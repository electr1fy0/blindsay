package server

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"server/internal/handlers"
	"server/internal/repository"
	"server/internal/service"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	router *http.ServeMux

	svc *service.Service
}

func New() (*Server, error) {
	db, err := pgxpool.New(context.Background(), os.Getenv("UNSAID_DB"))
	if err != nil {
		return nil, err
	}

	repo := repository.New(db)
	svc := service.New(repo)
	s := &Server{
		svc:    svc,
		router: http.NewServeMux(),
	}

	s.setupRouter()

	return s, nil

}

func (s *Server) Run() {
	srv := &http.Server{
		Addr:    ":8080",
		Handler: s.router,
	}
	if err := srv.ListenAndServe(); err != nil {
		slog.Error("server error", "error", err)
	}
}

func (s *Server) setupRouter() {
	h := handlers.Handler{
		Service: s.svc,
	}
	s.router.HandleFunc("GET /users/{id}", h.GetUser)
	s.router.HandleFunc("POST /users", h.Signup)
}
