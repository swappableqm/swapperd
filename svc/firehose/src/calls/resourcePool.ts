import * as grpc from "@grpc/grpc-js";
import { GetResourcePoolsRequest, GetResourcePoolsResponse } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch } from "../lib/proxmox";
import { Proxmox } from "proxmox-api";
export const getResourcePools = async (call: grpc.ServerUnaryCall<GetResourcePoolsRequest, GetResourcePoolsResponse>, callback: grpc.sendUnaryData<GetResourcePoolsResponse>): Promise<void> => {
    const request: Proxmox.poolsIndex[] = await pveFetch("/pools");
    callback(null, {
        resourcePools: request.map((resourcePool) => {
            return {
                id: resourcePool.poolid?.toString() ?? "",
                qms: []
            }
        })
    });
};