package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type APIHandler struct {
	DB *pgxpool.Conn
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

func (h *APIHandler) Signin(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var user SigninRequest
}
func (h *APIHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
}
func (h *APIHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {

}

// func (h *APIHandler) Signup(w http.ResponseWriter, r *http.Request) {

// }
// func (h *APIHandler) Signup(w http.ResponseWriter, r *http.Request) {
// }
// func (h *APIHandler) Signup(w http.ResponseWriter, r *http.Request) { }
func main() {
	r := http.NewServeMux()
	var h APIHandler
	r.HandleFunc("/auth/signup", h.Signup)

	srv := http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	log.Fatal(srv.ListenAndServe())
}
