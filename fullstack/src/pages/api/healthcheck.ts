import type { NextApiRequest, NextApiResponse } from "next";

// GET /api/healthcheck
const handler = (req: NextApiRequest, res: NextApiResponse): void => {
    if (req.method === "GET") {
        res.status(200).send("OK");
    }
    else {
        res.status(405).send({ message: "Method not allowed" });
    }
};

export default handler;
