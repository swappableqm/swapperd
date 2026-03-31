import { fetch } from "bun";

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

export const pveHello = async (): Promise<any> => {
    const response = await fetch(pveDetails.host + "/api2/json/version", {
        method: "GET",
        ...pveFetchOptions,
    });

    if (!response.ok) {
        console.log(response)
        throw new Error("Failed to fetch PVE status");
    }

    const data = await response.json();
    return data.data;
}

export const pveFetch = async (path: string, init?: BunFetchRequestInit): Promise<any> => {
    const response = await fetch(pveDetails.host + "/api2/json" + path, {
        method: "GET",
        ...pveFetchOptions,
        ...init,
    }).catch((err) => {
        throw new Error(`Failed to fetch PVE data: ${err}`);
    });


    const data = await response.json();
    return data.data;
}