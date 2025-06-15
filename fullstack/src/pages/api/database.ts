import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/services/databaseService";

async function checkPostgresConnection(): Promise<string | null | undefined> {
    try {
        const users = await prisma.user.findMany().then((e: any) => e);

        return users;
    }
    catch (error) {
        console.error("Ошибка подключения", error);
        return undefined;
    }
}

// GET /api/database
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method === "GET") {
        const msg = await checkPostgresConnection();

        res.status(200).json(msg);
    }
    else {
        res.status(405).send({ message: "Method not allowed" });
    }
};

export default handler;

// // http://localhost:3006/api/database

// // http://192.168.1.84/api/database

// // http://192.168.1.84
