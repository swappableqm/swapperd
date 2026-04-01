import 'dotenv/config';

import * as grpc from "@grpc/grpc-js";
import { firehoseServiceDefinition } from "@/proto/gen/ts/v3/firehose/firehose.grpc-server";
import { firehoseService } from "./calls";
import { logLevels, logServices, uniformLog } from './lib/util';

const initServer: () => grpc.Server = () => {
    const server = new grpc.Server();
    server.addService(firehoseServiceDefinition, firehoseService);
    return server;
};

const createNetworkServer = async (addr: string): Promise<void> => {
    const server = initServer();
    server.bindAsync(addr ?? "0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.log(err)
            process.exit(1)
        }

        uniformLog(logLevels["info"], logServices.server, `listening on ${addr}`);
    });
};

if (require.main === module) {
    createNetworkServer(process.env.FIREHOSE_LISTEN ?? "0.0.0.0:50051")
}