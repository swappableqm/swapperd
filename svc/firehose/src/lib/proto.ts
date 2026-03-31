import { QM_Status } from "@/proto/gen/ts/v3/firehose/firehose";
import { Proxmox } from "proxmox-api";

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

export const qmProtoiser = (qm: Proxmox.nodesQemuVm) => {
    return {
        id: qm.vmid?.toString() ?? "",
        name: qm.name?.toString() ?? "",
        status: statusToEnum(qm.status ?? ""),
    }
}