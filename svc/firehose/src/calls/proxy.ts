import * as grpc from "@grpc/grpc-js";

export const PVEProxy = (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): void => {
    callback(null, {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: Buffer.from(JSON.stringify({
            "test": "test",
        })),
    });
};