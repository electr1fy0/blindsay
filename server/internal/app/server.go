package server

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"server/internal/handlers"
	"server/internal/middleware"
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

	svc := service.New(db)
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
		Handler: middleware.CORS(middleware.Logger(s.router)),
	}
	if err := srv.ListenAndServe(); err != nil {
		slog.Error("server error", "error", err)
	}
}

func (s *Server) setupRouter() {
	h := handlers.Handler{
		Service: s.svc,
	}
	s.router.HandleFunc("GET /{username}", h.GetUserByUsername)
	s.router.HandleFunc("POST /auth/signup", h.Signup)
	s.router.HandleFunc("POST /auth/signin", h.Signin)
	s.router.HandleFunc("POST /{username}/messages", h.CreateMessage)
	s.router.HandleFunc("POST /{username}/messages/replies", h.ReplyToMessage)
	s.router.HandleFunc("GET /{username}/messages", h.GetMessages)
}
