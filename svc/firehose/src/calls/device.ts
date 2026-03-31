import * as grpc from "@grpc/grpc-js";
import { Device_Type, GetDevicesRequest, GetDevicesResponse } from "@/proto/gen/ts/v3/firehose/firehose";
import { pveFetch, pveHello } from "../lib/proxmox";

export const getDevices = async (call: grpc.ServerUnaryCall<GetDevicesRequest, GetDevicesResponse>, callback: grpc.sendUnaryData<GetDevicesResponse>): Promise<void> => {
    callback(null, {
        devices: [
            {
                type: Device_Type.PCI,
                id: "1",
                as: "test",
                connected: true,
                active: true,
            },
        ],
    });
};