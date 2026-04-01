import { Struct } from "@/proto/gen/ts/google/protobuf/struct";
import { Device, Device_Type, QM, QM_Status } from "@/proto/gen/ts/v3/firehose/firehose";
import type { Proxmox } from "proxmox-api";

export const statusToEnum = (status: string): QM_Status => {
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
}

/* QM Protoiser */

export const qmProtoiser = (qm: Proxmox.nodesQemuVm): QM => ({
    id: qm.vmid?.toString() ?? "",
    name: qm.name?.toString() ?? "",
    status: statusToEnum(qm.status ?? ""),
    tags: qm.tags?.split(",") ?? [],
    devices: []
})

export type _internalDeviceMappingData = {
    id: string;
    node: string;
} & Record<string, string>;

/* Device Protoiser */

export type DeviceProtoiser = {
    (device: Proxmox.clusterMappingPciIndex): Device;
    (device: Proxmox.clusterMappingUsbIndex): Device;
}

export const _generateDeviceMetadata = (data: _internalDeviceMappingData): Struct | undefined => {
    // remove empty values and remove id + node keys (they're redundant)
    const metadata = Object.entries(data).filter(([key, value]) => {
        return key !== "id" && key !== "node" && value !== "";
    }).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    // if metadata is empty, return undefined
    if (Object.keys(metadata).length === 0) return undefined;

    return Struct.fromJson(metadata);
}

export const deviceProtoiser: DeviceProtoiser = (device) => {
    // convert key=content to json
    const mappings: _internalDeviceMappingData[] = device.map?.map((map) => {
        const props = map.split(",").map((prop) => {
            const [key = "", value = ""] = prop.split("=");
            return { [key]: value };
        });
        return Object.assign({}, ...props);
    }) ?? [];

    // select the first mapping in the array. swapperd is designed to be used in a single-node setup anyway
    const mapping: _internalDeviceMappingData = mappings[0] ?? { id: "", node: "" };

    return {
        type: device.type === "pci" ? Device_Type.PCI : Device_Type.USB,
        name: device.id?.toString() ?? "",
        node: mapping.node?.toString() ?? "",
        id: mapping.id?.toString() ?? "",
        as: device.as?.toString() ?? "",
        connected: false,
        active: false,
        metadata: _generateDeviceMetadata(mapping),
    };
}