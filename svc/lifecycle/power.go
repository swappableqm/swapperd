package main

import (
	"context"

	"connectrpc.com/connect"
	"github.com/samber/lo"

	"github.com/swappableqm/swapperd/common/stdclient"
	"github.com/swappableqm/swapperd/common/stdlog"
	"github.com/swappableqm/swapperd/proto/gen/go/v3/firehose"
	"github.com/swappableqm/swapperd/proto/gen/go/v3/lifecycle"
)

// (if you're looking for the code that takes care of queueing swaps
// and managing the lock/active mechanism, orchestrator does that)
/// (svc/orchestrator)

// get all qms from firehose and compare to req.QmId
func _singleQm(qmid string) (*firehose.QM, error) {
	fh, err := stdclient.FirehoseClient()
	if err != nil {
		return nil, err
	}

	allQms, err := fh.GetQMs(context.Background(), &firehose.GetQMsRequest{})
	if err != nil {
		return nil, err
	}

	// get the requested qm
	qm := lo.FindOrElse(allQms.Qms, nil, func(qm *firehose.QM) bool {
		return qm.Id == qmid
	})

	return qm, nil
}

// predicate to check if a qm is online
func _qmOnline(qm *firehose.QM) bool {
	return qm.Status == firehose.QM_STATUS_RUNNING || qm.Status == firehose.QM_STATUS_PAUSED
}

// start a qm
func _startQm(qm *firehose.QM) error {
	stdlog.LifecycleLog(
		stdlog.LogLevels["debug"],
		stdlog.LogServices["grpc-bus"],
		"Starting QM",
		qm.Id,
		"("+qm.Name+")",
	)

	fh, err := stdclient.FirehoseClient()
	if err != nil {
		return err
	}

	_, err = fh.PVEProxy(context.Background(), &firehose.PVEProxyRequest{
		Method: firehose.PVEProxyRequest_METHOD_POST,
		Path:   "/nodes/" + qm.Node + "/qemu/" + qm.Id + "/status/start",
	})

	if err != nil {
		return err
	}

	return nil
}

// stop a qm
func _stopQm(qm *firehose.QM) error {
	stdlog.LifecycleLog(
		stdlog.LogLevels["info"],
		stdlog.LogServices["grpc-bus"],
		"Stopping QM",
		qm.Id,
		"("+qm.Name+")",
	)

	fh, err := stdclient.FirehoseClient()
	if err != nil {
		return err
	}

	_, err = fh.PVEProxy(context.Background(), &firehose.PVEProxyRequest{
		Method: firehose.PVEProxyRequest_METHOD_POST,
		Path:   "/nodes/" + qm.Node + "/qemu/" + qm.Id + "/status/stop",
	})

	if err != nil {
		return err
	}

	return nil
}

// grpc call that directly starts a QM.
// only powers on the QM and gracefully handles conflicts,
// but does not handle locking or device sync.
func (s *ServiceServer) Start(ctx context.Context, req *lifecycle.StartRequest, stream *connect.ServerStream[lifecycle.StartResponse]) error {
	qm, err := _singleQm(req.Id)
	if qm == nil || err != nil {
		stream.Send(&lifecycle.StartResponse{
			Qm:      nil,
			Success: false,
		})
		if err != nil {
			stdlog.LifecycleLog(stdlog.LogLevels["error"], stdlog.LogServices["grpc-bus"], "Failed to get QM", err)
		}
		return nil
	}

	// if the requested qm is online, return success
	if _qmOnline(qm) {
		stream.Send(&lifecycle.StartResponse{
			Qm:      qm,
			Success: true,
		})
		return nil
	}

	_startQm(qm)

	stream.Send(&lifecycle.StartResponse{
		Qm:      qm,
		Success: true,
	})

	return nil
}

// grpc call that directly starts a QM.
// takes care of device sync and actually powering on the QM, but
// will fail out if another online QM has locked the devices.
func (s *ServiceServer) Stop(ctx context.Context, req *lifecycle.StopRequest, stream *connect.ServerStream[lifecycle.StopResponse]) error {
	qm, err := _singleQm(req.Id)
	if qm == nil || err != nil {
		stream.Send(&lifecycle.StopResponse{
			Qm:      nil,
			Success: false,
		})
		if err != nil {
			stdlog.LifecycleLog(stdlog.LogLevels["error"], stdlog.LogServices["grpc-bus"], "Failed to get QM", err)
		}
		return nil
	}

	// if the requested qm is online, return success
	if !_qmOnline(qm) {
		stream.Send(&lifecycle.StopResponse{
			Qm:      qm,
			Success: true,
		})
		return nil
	}

	_stopQm(qm)

	stream.Send(&lifecycle.StopResponse{
		Qm:      qm,
		Success: true,
	})

	return nil
}
