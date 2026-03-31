import * as grpc from "@grpc/grpc-js";
import { GetResourcePoolsRequest, GetResourcePoolsResponse } from "@/proto/gen/ts/v3/firehose/firehose";
export const getResourcePools = (call: grpc.ServerUnaryCall<GetResourcePoolsRequest, GetResourcePoolsResponse>, callback: grpc.sendUnaryData<GetResourcePoolsResponse>): void => {
    callback(null, {
        resourcePools: [
            {
                id: "1",
                qms: [
                    {
                        id: "1",
                        name: "test",
                        status: 0,
                    },
                ],
            }
        ]
    });
};