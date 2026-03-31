import * as grpc from "@grpc/grpc-js";
import { GetQMsRequest, GetQMsResponse, QM, QM_Status } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch } from "../lib/proxmox";
import { Proxmox } from "proxmox-api";

const getStatus = (status: string): QM["status"] => {
    switch (status) {
        case "running":
            return QM_Status.RUNNING;
        case "paused":
            return QM_Status.PAUSED;
        case "stopped":
            return QM_Status.STOPPED;
        case "prelaunch":
            return QM_Status.PRELAUNCH;
        default:
            return QM_Status.UNSPECIFIED;
    }
};

export const getQMs = async (call: grpc.ServerUnaryCall<GetQMsRequest, GetQMsResponse>, callback: grpc.sendUnaryData<GetQMsResponse>): Promise<void> => {
    const request: QM[] = await pveFetch("/cluster/resources?type=vm").then((data: Proxmox.clusterResourcesResources[]) => {
        return data.filter(vm => vm.type === "qemu").map((resource) => {
            return {
                id: resource.vmid?.toString() ?? "",
                name: resource.name?.toString() ?? "",
                status: getStatus(resource.status ?? "stopped"),
            }
        });
    });
    callback(null, {
        qms: request
    });
};