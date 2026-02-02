package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

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
