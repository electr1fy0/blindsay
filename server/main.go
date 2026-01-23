package main

import (
	"context"
	"encoding/json"
	"fmt"
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

type Reply struct {
	ID         string `json:"id"`
	Content    string `json:"content"`
	QuestionID string `json:"questionId"`
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

func CORS(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Credentials", "True")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	}
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

	rows, err := h.DB.Query(r.Context(), "select id, content from unsaid_questions where user_id = $1", userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	for rows.Next() {
		var q Question
		err = rows.Scan(&q.ID, &q.Content)
		questions = append(questions, q)
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(questions)
}

func (h *APIHandler) ListReplies(w http.ResponseWriter, r *http.Request) {
	qid := r.PathValue("qid")

	var replies []Reply

	rows, err := h.DB.Query(r.Context(), "select id, content, question_ID from unsaid_replies where question_id = $1", qid)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	for rows.Next() {
		var r Reply
		err = rows.Scan(&r.ID, &r.Content, &r.QuestionID)
		replies = append(replies, r)
	}

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(replies)
}

func (h *APIHandler) ReplyToQuestion(w http.ResponseWriter, r *http.Request) {
	var a Reply
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	fmt.Println(a)
	_, err = h.DB.Exec(r.Context(), "insert into unsaid_replies (content, question_id) values ($1, $2) ", a.Content, a.QuestionID)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusCreated)
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
	r.HandleFunc("POST /{username}/questions/replies", h.ReplyToQuestion)
	r.HandleFunc("GET /{username}/questions/replies/{qid}", h.ListReplies)

	srv := http.Server{
		Addr:    ":8080",
		Handler: CORS(r),
	}

	log.Fatal(srv.ListenAndServe())
}
