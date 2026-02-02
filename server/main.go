package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"
	"server/internal/handlers"
)

func main() {
	handler := slog.NewTextHandler(os.Stdout, nil)
	logger := slog.New(handler)
	slog.SetDefault(logger)

	r := http.NewServeMux()

	// db, _ := pgxpool.New(context.Background(), os.Getenv("POSTGRES_CONN_STR"))
	h := handlers.Handler{}
	r.HandleFunc("/auth/signup", h.Signup)
	r.HandleFunc("POST /{username}/questions", h.CreateQuestion)
	r.HandleFunc("GET /{username}/questions", h.ListQuestions)
	r.HandleFunc("POST /{username}/questions/replies", h.ReplyToQuestion)
	r.HandleFunc("GET /{username}/questions/replies/{qid}", h.ListReplies)

	srv := http.Server{
		Addr:    ":8080",
		Handler: CORS(r),
	}

	log.Fatal(srv.ListenAndServe())
}
