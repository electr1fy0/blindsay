package main

import (
	"log/slog"
	"os"
	server "server/internal/app"
)

func main() {
	handler := slog.NewTextHandler(os.Stdout, nil)
	logger := slog.New(handler)
	slog.SetDefault(logger)

	srv, err := server.New()
	if err != nil {
		slog.Error("failed to start server", "error", err)
		os.Exit(1)
	}

	srv.Run()
}
