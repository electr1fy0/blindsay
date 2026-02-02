package main

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

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
