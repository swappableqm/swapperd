import { IFirehoseService } from "@/proto/gen/ts/v3/firehose/firehose.grpc-server";
import { getQMs } from "./qm";
import { getDevices } from "./device";
import { PVEProxy } from "./proxy";
import { getResourcePools } from "./resourcePool";

export const firehoseService: IFirehoseService = {
    getQMs,
    getResourcePools,
    getDevices,
    pVEProxy: PVEProxy
}