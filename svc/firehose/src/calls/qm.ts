import * as grpc from "@grpc/grpc-js";
import { GetQMsRequest, GetQMsResponse, QM, QM_Status } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch } from "../lib/proxmox";
import { Proxmox } from "proxmox-api";
import { statusToEnum } from "../lib/proto";

export const getQMs = async (call: grpc.ServerUnaryCall<GetQMsRequest, GetQMsResponse>, callback: grpc.sendUnaryData<GetQMsResponse>): Promise<void> => {
    const request: QM[] = await pveFetch("/cluster/resources?type=vm").then((data: Proxmox.clusterResourcesResources[]) => {
        return data.filter(vm => vm.type === "qemu").map((resource) => {
            return {
                id: resource.vmid?.toString() ?? "",
                name: resource.name?.toString() ?? "",
                status: statusToEnum(resource.status ?? ""),
            }
        });
    });
    callback(null, {
        qms: request
    });
};