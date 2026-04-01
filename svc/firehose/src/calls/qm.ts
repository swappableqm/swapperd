import * as grpc from "@grpc/grpc-js";
import { GetQMsRequest, GetQMsResponse, QM, QM_Status } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch } from "../lib/proxmox";
import type { Proxmox } from "proxmox-api";
import { qmProtoiser, statusToEnum } from "../lib/proto";

export const _qm = async (id: string, node: string): Promise<QM> => {
    const { ok, data } = await pveFetch<Proxmox.nodesQemuVm>(`/nodes/${node}/qemu/${id}`).catch(() => {
        throw new Error("Failed to fetch QM");
    });

    if (!ok) throw new Error("Failed to fetch QM");

    return qmProtoiser(data);
};

export const _allQMs = async (): Promise<QM[]> => {
    const { data } = await pveFetch<Proxmox.nodesQemuVm[]>("/cluster/resources?type=vm").catch(() => {
        throw new Error("Failed to fetch QMs");
    });

    return data.filter((vm) => vm.type === "qemu").map((resource) => {
        return qmProtoiser(resource);
    });
};

export const getQMs = async (call: grpc.ServerUnaryCall<GetQMsRequest, GetQMsResponse>, callback: grpc.sendUnaryData<GetQMsResponse>): Promise<void> => {
    callback(null, {
        qms: await _allQMs()
    });
};