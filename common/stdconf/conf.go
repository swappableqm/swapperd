package stdconf

import (
	"log"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	LifecycleListen string `env:"LIFECYCLE_LISTEN" envDefault:"localhost:50052"`
	GrpcFirehose    string `env:"GRPC_FIREHOSE_ADDRESS" envDefault:"localhost:50051"`
}

func EnvInit() Config {
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
