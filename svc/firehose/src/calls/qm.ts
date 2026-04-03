import * as grpc from "@grpc/grpc-js";
import { Device, Device_Type, GetQMsRequest, GetQMsResponse, QM, QM_Status } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch } from "../lib/proxmox";
import type { Proxmox } from "proxmox-api";
import { qmProtoiser, statusToEnum } from "../lib/proto";
import { _devices } from "./device";

export const _qm = async (resource: Proxmox.clusterResourcesResources, devices: Device[] = []): Promise<QM> => {
    const { ok: configOk, data: config } = await pveFetch<Proxmox.nodesQemuConfigVmConfig>(`/nodes/${resource?.node?.toString() ?? "0"}/qemu/${resource?.vmid?.toString() ?? "0"}/config`).catch((e) => {
        throw new Error(`Failed to fetch QM: ${e}`);
    });

    if (!configOk) throw new Error("Failed to fetch QM");

    return qmProtoiser(resource, config, devices);
};

export const _allQMs = async (): Promise<QM[]> => {
    // get list of all QMs
    const { data } = await pveFetch<Proxmox.clusterResourcesResources[]>("/cluster/resources?type=vm").catch(() => {
        throw new Error("Failed to fetch QMs");
    });

    // get list of all devices
    const pciDevices = await _devices(Device_Type.PCI, true);
    const usbDevices = await _devices(Device_Type.USB, true);

    return Promise.all(data.filter((vm) => vm.type === "qemu").map(async (resource) => {
        // get each qm
        const qm = await _qm(resource, [...pciDevices, ...usbDevices]);

        return qm;
    }));
};

export const getQMs = async (call: grpc.ServerUnaryCall<GetQMsRequest, GetQMsResponse>, callback: grpc.sendUnaryData<GetQMsResponse>): Promise<void> => {
    callback(null, {
        qms: await _allQMs()
    });
};