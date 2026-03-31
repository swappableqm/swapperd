package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	firehosev3 "github.com/swappableqm/swapperd/proto/gen/v3/firehose"
	"github.com/swappableqm/swapperd/proto/gen/v3/firehose/firehoseconnect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

const address = "localhost:8080"

func main() {
	mux := http.NewServeMux()
	path, handler := firehoseconnect.NewFirehoseServiceHandler(&firehoseServiceServer{})
	mux.Handle(path, handler)
	fmt.Println("... swapperd.firehose listening on", address)
	http.ListenAndServe(
		address,
		// Use h2c so we can serve HTTP/2 without TLS.
		h2c.NewHandler(mux, &http2.Server{}),
	)
}

type firehoseServiceServer struct {
	firehoseconnect.UnimplementedFirehoseServiceHandler
}

func (s *firehoseServiceServer) GetQMs(ctx context.Context, req *firehosev3.GetQMsRequest) (*firehosev3.GetQMsResponse, error) {
	log.Printf("GetQMs called with %v", req)
	return &firehosev3.GetQMsResponse{
		Qms: []*firehosev3.QM{
			{
				Id:     "2",
				Name:   "test",
				Status: firehosev3.QM_STATUS_RUNNING,
			},
		},
	}, nil
}
