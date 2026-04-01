import * as grpc from "@grpc/grpc-js";
import { Device, Device_Type, GetDevicesRequest, GetDevicesResponse } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch, pveHello } from "../lib/proxmox";
import type { Proxmox } from "proxmox-api";
import { deviceProtoiser } from "../lib/proto";

export const _devices = async (type: Device_Type = Device_Type.USB): Promise<Device[]> => {
    const strType = type === Device_Type.PCI ? "pci" : "usb";
    const { ok, data } = await pveFetch<Proxmox.clusterMappingPciIndex[]>(`/cluster/mapping/${strType}`).catch(() => {
        throw new Error("Failed to fetch devices");
    });

    if (!ok) throw new Error("Failed to fetch devices");

    return data.map((device) => {
        return deviceProtoiser(device);
    });
};

export const getDevices = async (call: grpc.ServerUnaryCall<GetDevicesRequest, GetDevicesResponse>, callback: grpc.sendUnaryData<GetDevicesResponse>): Promise<void> => {
    callback(null, {
        devices: [...(await _devices(Device_Type.PCI)), ...(await _devices(Device_Type.USB))],
    });
};