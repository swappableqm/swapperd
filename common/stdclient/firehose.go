package stdclient

import (
	"crypto/tls"
	"net"
	"net/http"

	"connectrpc.com/connect"
	"github.com/swappableqm/swapperd/common/stdconf"
	"github.com/swappableqm/swapperd/proto/gen/go/v3/firehose/firehoseconnect"
	"golang.org/x/net/http2"
)

func FirehoseClient() (firehoseconnect.FirehoseServiceClient, error) {
	h2cClient := &http.Client{
		Transport: &http2.Transport{
			AllowHTTP: true, // h2c requirement
			DialTLS: func(network, addr string, _ *tls.Config) (net.Conn, error) {
				return net.Dial(network, addr) // disable tls
			},
		},
	}

	cfg := stdconf.EnvInit()
	client := firehoseconnect.NewFirehoseServiceClient(
		h2cClient,
		cfg.GrpcFirehose,
		connect.WithGRPC(),
	)

	return client, nil
}
