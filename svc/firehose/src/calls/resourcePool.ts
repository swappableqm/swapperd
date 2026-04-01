import * as grpc from "@grpc/grpc-js";
import { GetResourcePoolsRequest, GetResourcePoolsResponse, ResourcePool } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch } from "../lib/proxmox";
import type { Proxmox } from "proxmox-api";
import { qmProtoiser, statusToEnum } from "../lib/proto";
import { _qm } from "./qm";

export const _resourcePool = async (id: string): Promise<ResourcePool> => {
    const { ok, data } = await pveFetch<Proxmox.poolsIndex>(`/pools/${id}`).catch(() => {
        throw new Error("Failed to fetch resource pool");
    });

    if (!ok) throw new Error("Failed to fetch resource pool");

    const qmGeneric = {
        id: "",
        node: "",
        type: "qemu",
        status: "unknown"
    }

    const qmMembers = await Promise.all(data.members?.map(async (m) => {
        const qm = await _qm(m.vmid?.toString() ?? "", m.node?.toString() ?? "");

        return qm;
    }) ?? []);

    return {
        id: data.poolid?.toString() ?? "",
        qms: qmMembers ?? []
    }
};

export const _allResourcePools = async () => {
    const { data }: { data: Proxmox.poolsIndex[] } = await pveFetch("/pools");

    return Promise.all(data.map(async (resourcePool) => {
        return await _resourcePool(resourcePool.poolid?.toString() ?? "");
    }));
};

export const getResourcePools = async (call: grpc.ServerUnaryCall<GetResourcePoolsRequest, GetResourcePoolsResponse>, callback: grpc.sendUnaryData<GetResourcePoolsResponse>): Promise<void> => {
    const pools = await _allResourcePools();

    callback(null, {
        resourcePools: pools
    });
};