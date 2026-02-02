package server

import (
	"net/http"
	"server/internal/service"
)

type Server struct {
	router *http.ServeMux

	svc *service.Service
}

func New() (*Server, error) {

	s := &Server{}

	s.setupRouter()

	return s, nil

}

func (s *Server) setupRouter() {

}
