import dotenv from "dotenv";
import { type User, PrismaClient } from "../../prisma/generated/prisma-client/client";

// const userDb = process.env.NEXT_PUBLIC_DB_USER_DEV;
// const passwordDb = process.env.NEXT_PUBLIC_DB_PASSWORD_DEV;
// const nameDb = process.env.NEXT_PUBLIC_DB_NAME_DEV;

// const databaseHost = process.platform === "win32" ? "localhost" : "full_db_postgres";

// const DATABASE_URL = `postgresql://${userDb}:${passwordDb}@${databaseHost}:5432/${nameDb}`;

export type IUser = User;

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL_DEV || "";

const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
    log: ["query", "info", "warn", "error"],
    // log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

declare global {
    var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "development") {
    global.prisma = prisma;
}

export default prisma;
