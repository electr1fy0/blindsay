package handlers

import (
	"encoding/json"
	"fmt"
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
		slog.Error("failed to decode signup body", "error", err)
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
		return
	}
	err := h.Service.Signup(r.Context(), user)
	if err != nil {
		slog.Error("failed to signup user", "error", err)
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
		slog.Error("failed to decode signin body", "error", err)
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
		return
	}

	err := h.Service.Signin(r.Context(), user)
	if err != nil {
		slog.Error("failed to signin user", "error", err)
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
		slog.Error("failed to get recipient", "error", err)
		writeJSON(w, http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
		return
	}

	var msg types.Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		slog.Error("failed to decode message body", "error", err)
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	msg.RecipientID = recipient.ID
	if err := h.Service.CreateMessage(r.Context(), msg); err != nil {
		slog.Error("failed to create message", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "message sent",
	})
}

func (h *Handler) GetMessages(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")

	messages, err := h.Service.GetMessages(r.Context(), username)
	if err != nil {
		slog.Error("failed to get messages", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, messages)
}

// func (h *Handler) ListReplies(w http.ResponseWriter, r *http.Request) {
// 	mid := r.PathValue("mid")

// 	var replies []Reply

// 	rows, err := h.DB.Query(r.Context(), "select id, content, message_id from unsaid_replies where message_id = $1", mid)
// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}

// 	for rows.Next() {
// 		var r Reply
// 		err = rows.Scan(&r.ID, &r.Content, &r.MessageID)
// 		replies = append(replies, r)
// 	}

// 	if err != nil {
// 		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 		return
// 	}

// 	json.NewEncoder(w).Encode(replies)
// }

func (h *Handler) ReplyToMessage(w http.ResponseWriter, r *http.Request) {
	var reply types.Reply
	err := json.NewDecoder(r.Body).Decode(&reply)
	if err != nil {
		slog.Error("failed to decode reply body", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	fmt.Println(reply.MessageID)
	if err = h.Service.CreateReply(r.Context(), reply); err != nil {
		slog.Error("failed to create reply", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
}
