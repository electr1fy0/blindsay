package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"server/internal/types"
	"time"
)

func (h *Handler) CheckEmail(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var req types.AuthCheckRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Error("failed to decode check email body", "error", err)
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
		return
	}
	time.Sleep(1 * time.Second)
	resp, err := h.Service.CheckEmail(r.Context(), req.Email)
	if err != nil {
		slog.Error("failed to check email", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *Handler) VerifyCode(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Error("failed to decode verify code body", "error", err)
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
		return
	}

	valid, err := h.Service.VerifyCode(r.Context(), req.Email, req.Code)
	if err != nil {
		slog.Error("failed to verify code", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	if !valid {
		writeJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "invalid code",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "code verified",
		"state":   "password_setup",
	})
}
