package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"server/internal/service"
	"server/internal/types"
)

type Handler struct {
	Service *service.Service
}

func (h *Handler) GetUserByUsername(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	username := r.PathValue("username")

	u, err := h.Service.GetUserByUsername(r.Context(), username)
	if err != nil {
		slog.Error("failed to get user", "error", err)
		writeJSON(w, 500, map[string]string{
			"error": "failed to get user",
		})

		return
	}

	writeJSON(w, 200, u)
}

func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var user types.SignupRequest

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
		return
	}

	err := h.Service.Signup(r.Context(), user)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "user created",
	})
}

func (h *Handler) Signin(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var user types.SigninRequest

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
		return
	}

	err := h.Service.Signin(r.Context(), user)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "invalid credentials",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "login successful",
	})
}

func (h *Handler) CreateMessage(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	username := r.PathValue("username")

	recipient, err := h.Service.GetUserByUsername(r.Context(), username)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
		return
	}

	var msg types.Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	msg.RecipientID = recipient.ID
	if err := h.Service.CreateMessage(r.Context(), msg); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "message sent",
	})
}

// func (h *Handler) ListQuestions(w http.ResponseWriter, r *http.Request) {
// 	// username := r.PathValue("username")

// 	var questions []types.Question
// 	var userID string
// 	// err := h.DB.QueryRow(r.Context(), "select id from unsaid_users where username = $1", username).Scan(&userID)
// 	// if err != nil {
// 	// 	writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 	// 	return
// 	// }

// 	rows, err := h.DB.Query(r.Context(), "select id, content from unsaid_questions where user_id = $1", userID)
// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}

// 	for rows.Next() {
// 		var q Question
// 		err = rows.Scan(&q.ID, &q.Content)
// 		questions = append(questions, q)
// 	}
// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}

// 	json.NewEncoder(w).Encode(questions)
// }

// func (h *Handler) ListReplies(w http.ResponseWriter, r *http.Request) {
// 	qid := r.PathValue("qid")

// 	var replies []Reply

// 	rows, err := h.DB.Query(r.Context(), "select id, content, question_ID from unsaid_replies where question_id = $1", qid)
// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}

// 	for rows.Next() {
// 		var r Reply
// 		err = rows.Scan(&r.ID, &r.Content, &r.QuestionID)
// 		replies = append(replies, r)
// 	}

// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}

// 	json.NewEncoder(w).Encode(replies)
// }

// func (h *APIHandler) ReplyToQuestion(w http.ResponseWriter, r *http.Request) {
// 	var a Reply
// 	err := json.NewDecoder(r.Body).Decode(&a)
// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}
// 	fmt.Println(a)
// 	_, err = h.DB.Exec(r.Context(), "insert into unsaid_replies (content, question_id) values ($1, $2) ", a.Content, a.QuestionID)

// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}
// 	w.WriteHeader(http.StatusCreated)
// }
