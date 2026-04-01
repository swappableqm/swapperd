# swapperd
Easily manage a Proxmox VE (PVE)-based VFIO setup. Written in Go and (Bun-based) TypeScript.

## Microservices
`swapperd` uses a microservice architecture. It uses gRPC to communicate between each microservice.

## Orchestrator
Orchestrator coordinates daemon operations and ensures PVE remains in a healthy state. It manages user-facing tasks like swapping between QMs and initiating manual device syncs. Written in Go.

### Lifecycle
Lifecycle handles the execution of operations provided by Orchestrator, passing raw requests through Firehose to PVE. It also manages routine operations (i.e. automatic device sync when devices are connected or disconnected). Written in Go.

### Firehose
Firehose manages all communication with PVE. It is both a data-source and a forward-proxy for Orchestrator and Lifecycle. Written in TypeScript.