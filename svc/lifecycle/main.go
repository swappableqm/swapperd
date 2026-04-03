package main

import (
	"net/http"

	"github.com/swappableqm/swapperd/common/stdconf"
	"github.com/swappableqm/swapperd/common/stdlog"
	"github.com/swappableqm/swapperd/proto/gen/go/v3/lifecycle/lifecycleconnect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func main() {
	cfg := stdconf.EnvInit()

	mux := http.NewServeMux()
	path, handler := lifecycleconnect.NewLifecycleServiceHandler(&ServiceServer{})
	mux.Handle(path, handler)
	stdlog.LifecycleLog(
		stdlog.LogLevels["info"],
		stdlog.LogServices["server"],
		"listening on "+cfg.LifecycleListen,
	)
	http.ListenAndServe(
		cfg.LifecycleListen,
		// Use h2c so we can serve HTTP/2 without TLS.
		h2c.NewHandler(mux, &http2.Server{}),
	)
}

type ServiceServer struct {
	lifecycleconnect.UnimplementedLifecycleServiceHandler
}
