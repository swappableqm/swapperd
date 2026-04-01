import type { IFirehoseService } from "@/proto/gen/ts/v3/firehose/firehose.grpc-server";
import { getQMs } from "./qm";
import { getDevices } from "./device";
import { PVEProxy } from "./proxy";
import { getResourcePools } from "./resourcePool";
import { logLevels, logServices, uniformLog } from "../lib/util";
import type { UntypedHandleCall } from "@grpc/grpc-js";

export const injectEvent = (fn: Function): UntypedHandleCall => {
    return async (...args: any[]) => {
        /* timings */
        const start = Date.now();
        const result = await fn(...args);
        const end = Date.now();

        uniformLog(logLevels["debug"], logServices["grpc-bus"], `${fn.name} took ${end - start}ms`);

        return result;
    }
}

export const injectEvents = (service: IFirehoseService): IFirehoseService => {
    // iterate over all methods and inject events
    for (const method in service) {
        const methodCall = service[method];
        if (typeof methodCall === "function") {
            service[method] = injectEvent(methodCall);
        }
    }

    return service;
};

export const firehoseService: IFirehoseService = injectEvents({
    getQMs,
    getResourcePools,
    getDevices,
    pVEProxy: PVEProxy
});