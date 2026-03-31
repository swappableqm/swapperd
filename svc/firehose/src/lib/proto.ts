import { QM_Status } from "@/proto/gen/ts/v3/firehose/firehose";

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