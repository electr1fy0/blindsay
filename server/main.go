package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type APIHandler struct {
	DB *pgxpool.Pool
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

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)

	_ = json.NewEncoder(w).Encode(v)
}

func (h *APIHandler) Signup(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var user SignupRequest

	json.NewDecoder(r.Body).Decode(&user)
	hash, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 10)

	h.DB.Exec(r.Context(), "insert into unsaid_users (username, email, password_hash) values ($1, $2, $3)", user.Username, user.Email, hash)

	w.WriteHeader(http.StatusCreated)
}

//	func (h *APIHandler) Signin(w http.ResponseWriter, r *http.Request) {
//		defer r.Body.Close()
//		var user SigninRequest
//	}
func (h *APIHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
}
func (h *APIHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {

}

// func (h *APIHandler) Signup(w http.ResponseWriter, r *http.Request) {

// }
// func (h *APIHandler) Signup(w http.ResponseWriter, r *http.Request) {
// }
// func (h *APIHandler) Signup(w http.ResponseWriter, r *http.Request) { }

// TODO:
// check if user exists first before making any op

type Question struct {
	ID      string `json:"id"`
	Content string `json:"content"`
}

func (h *APIHandler) CreateQuestion(w http.ResponseWriter, r *http.Request) {
	// TODO
	// check if blocked session
	username := r.PathValue("username")

	var userID string
	err := h.DB.QueryRow(r.Context(), "select id from unsaid_users where username = $1", username).Scan(&userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	var q Question
	err = json.NewDecoder(r.Body).Decode(&q)

	_, err = h.DB.Exec(r.Context(), "insert into unsaid_questions (user_id, content) values ($1, $2)", userID, q.Content)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *APIHandler) ListQuestions(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")

	var questions []Question
	var userID string
	err := h.DB.QueryRow(r.Context(), "select id from unsaid_users where username = $1", username).Scan(&userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	rows, err := h.DB.Query(r.Context(), "select content from unsaid_questions where user_id = $1", userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	for rows.Next() {
		var q Question
		err = rows.Scan(&q.Content)
		questions = append(questions, q)
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(questions)
}

func (h *APIHandler) ReplyToQuestion() {

}

func main() {
	r := http.NewServeMux()

	db, _ := pgxpool.New(context.Background(), os.Getenv("POSTGRES_CONN_STR"))
	h := APIHandler{
		DB: db,
	}
	r.HandleFunc("/auth/signup", h.Signup)
	r.HandleFunc("POST /{username}/questions", h.CreateQuestion)
	r.HandleFunc("GET /{username}/questions", h.ListQuestions)
	// r.HandleFunc("POST /{username}/questions/{qid}", h.ReplyToQuestion)

	srv := http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	log.Fatal(srv.ListenAndServe())
}
