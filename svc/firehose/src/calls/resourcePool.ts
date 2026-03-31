import * as grpc from "@grpc/grpc-js";
import { GetResourcePoolsRequest, GetResourcePoolsResponse } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch } from "../lib/proxmox";
import { Proxmox } from "proxmox-api";
import { qmProtoiser, statusToEnum } from "../lib/proto";
export const getResourcePools = async (call: grpc.ServerUnaryCall<GetResourcePoolsRequest, GetResourcePoolsResponse>, callback: grpc.sendUnaryData<GetResourcePoolsResponse>): Promise<void> => {
    const request: Proxmox.poolsIndex[] = await pveFetch("/pools");

    const pools = Promise.all(request.map(async (resourcePool) => {
        const qms = await pveFetch(`/pools/${resourcePool?.poolid?.toString()}`).then(d => d.members?.map(m => qmProtoiser(m)));
        return {
            id: resourcePool.poolid?.toString() ?? "",
            qms: qms
        }
    }));

    callback(null, {
        resourcePools: await pools
    });
};