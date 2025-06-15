import ky from "ky";
import type { KyInstance } from "ky/distribution/types/ky";

const apiUrl = "/api/";

export const apiRoot: KyInstance = ky.create({
    prefixUrl: apiUrl,
    credentials: "include",
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
    retry: {
        limit: 3,
        methods: ["get", "post", "patch"],
        statusCodes: [403],
        backoffLimit: 3000,
    },
});
