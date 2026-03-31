package main

import (
	"context"
	"log"
	"net/http"

	env "github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
	"github.com/swappableqm/swapperd/proto/gen/go/v3/lifecycle"
	"github.com/swappableqm/swapperd/proto/gen/go/v3/lifecycle/lifecycleconnect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

// env struct
type Config struct {
	Listen string `env:"FIREHOSE_LISTEN" envDefault:"localhost:8080"`
}

func envInit() Config {
	// load env
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found, using environment variables only")
	}

	// parse env into config struct
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		log.Println(err)
	}

	return cfg
}

func main() {
	cfg := envInit()

	mux := http.NewServeMux()
	path, handler := lifecycleconnect.NewLifecycleServiceHandler(&ServiceServer{})
	mux.Handle(path, handler)
	log.Println("listening on", cfg.Listen)
	http.ListenAndServe(
		cfg.Listen,
		// Use h2c so we can serve HTTP/2 without TLS.
		h2c.NewHandler(mux, &http2.Server{}),
	)
}

type ServiceServer struct {
	lifecycleconnect.UnimplementedLifecycleServiceHandler
}

func (s *ServiceServer) Start(ctx context.Context, req *lifecycle.StartRequest) (*lifecycle.StartResponse, error) {
	log.Printf("Start called with %v", req)
	return &lifecycle.StartResponse{
		Success: true,
	}, nil
}
