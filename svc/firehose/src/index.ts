import 'dotenv/config';

import * as grpc from "@grpc/grpc-js";
import { firehoseServiceDefinition } from "@/proto/gen/ts/v3/firehose/firehose.grpc-server";
import { firehoseService } from "./calls";

const initServer: () => grpc.Server = () => {
    const server = new grpc.Server();
    server.addService(firehoseServiceDefinition, firehoseService);
    return server;
};

if (require.main === module) {
    const server = initServer();
    server.bindAsync(process.env.FIREHOSE_LISTEN ?? "0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening on ${port}`);
    });
}