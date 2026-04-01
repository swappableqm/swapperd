import { fetch } from "bun";
import type { Proxmox } from "proxmox-api";

export type PVEFetchResponse<T> = {
    ok: boolean;
    data: T;
    raw?: Response;
};

export const pveDetails = {
    host: process.env.FIREHOSE_PVE_URL ?? "https://localhost:8006",
    tokenId: process.env.FIREHOSE_PVE_TOKEN_ID ?? "test",
    tokenSecret: process.env.FIREHOSE_PVE_TOKEN_SECRET ?? "test",
};

// Firehose ONLY supports PVE token authentication.
export const pveFetchOptions: BunFetchRequestInit = {
    headers: {
        "Authorization": "PVEAPIToken=" + pveDetails.tokenId + "=" + pveDetails.tokenSecret,
    },
    tls: {
        rejectUnauthorized: false,
    }
}

export const pveHello = async (): Promise<PVEFetchResponse<Proxmox.versionVersion>> => {
    const response = await fetch(pveDetails.host + "/api2/json/version", {
        method: "GET",
        ...pveFetchOptions,
    });

    if (!response.ok) {
        console.log(response)
        throw new Error("Failed to fetch PVE status");
    }

    const data: any = await response.json();
    return {
        ok: response.ok,
        data: data?.data,
        raw: response
    };
}

export const pveFetch = async <T>(path: string, init?: BunFetchRequestInit): Promise<PVEFetchResponse<T>> => {
    const response = await fetch(pveDetails.host + "/api2/json" + path, {
        method: "GET",
        ...pveFetchOptions,
        ...init,
    }).catch((err) => {
        throw new Error(`Failed to fetch PVE data: ${err}`);
    });

    const data: any = await response.json();

    return {
        ok: response.ok,
        data: data?.data,
        raw: response
    };
};

export const pveBaseFetch = async (path: string, init?: BunFetchRequestInit): Promise<Response> => {
    const response = await fetch(pveDetails.host + "/api2/json" + path, {
        ...pveFetchOptions,
        ...init,
        headers: {
            ...pveFetchOptions.headers,
            ...init?.headers,
        }
    }).catch((err) => {
        throw new Error(`Failed to fetch PVE data: ${err}`);
    });

    return response;
};