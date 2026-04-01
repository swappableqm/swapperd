import { PVEProxyRequest, PVEProxyRequest_METHOD, PVEProxyResponse } from "@/proto/gen/ts/v3/firehose/firehose";
import * as grpc from "@grpc/grpc-js";
import { pveBaseFetch, pveFetch } from "../lib/proxmox";
import { Struct } from "@/proto/gen/ts/google/protobuf/struct";

const _methodMap = {
    [PVEProxyRequest_METHOD.METHOD_UNSPECIFIED]: "UNSPECIFIED",
    [PVEProxyRequest_METHOD.METHOD_GET]: "GET",
    [PVEProxyRequest_METHOD.METHOD_POST]: "POST",
    [PVEProxyRequest_METHOD.METHOD_PUT]: "PUT",
    [PVEProxyRequest_METHOD.METHOD_DELETE]: "DELETE",
}

const _generateInternalError = (message: string): PVEProxyResponse => {
    return {
        statusCode: -1,
        headers: {
            "Content-Type": "application/json",
        },
        body: Struct.fromJson({
            "internalError": true,
            "error": message,
        }),
    };
}

const _cleanHeaders = (headers: Record<string, string>): Record<string, string> => {
    // remove empty header keys
    const cleanHeaders = Object.entries(headers).filter(([key, value]) => {
        return key !== "" && value !== "";
    }).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cleanHeaders;
}

export const PVEProxy = async (call: grpc.ServerUnaryCall<PVEProxyRequest, PVEProxyResponse>, callback: grpc.sendUnaryData<PVEProxyResponse>): Promise<void> => {
    const { request: params } = call;

    // get the method from the request enum
    const method = _methodMap[params.method];

    // handle unspecified/generic method
    if (method === "UNSPECIFIED") {
        callback(null, _generateInternalError("Method unspecified"));
        return;
    };

    if (params.path?.length === 0) {
        callback(null, _generateInternalError("Path unspecified"));
        return;
    }

    const request = await pveBaseFetch(params.path, {
        method: method,
        headers: _cleanHeaders(params.headers),
        body: params.body,
    }).catch((err) => {
        callback(null, _generateInternalError(err.message));

        return new Response(JSON.stringify({
            "internalError": true,
            "error": err.message,
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    });

    const jsonRaw = (await request.json()) ?? {};

    callback(null, {
        statusCode: request?.status ?? -1,
        headers: request?.headers.toJSON() ?? {},
        body: Struct.fromJson({
            ...jsonRaw
        }),
    });
};