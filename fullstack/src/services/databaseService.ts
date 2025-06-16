import dotenv from "dotenv";
import { type User, PrismaClient } from "../../prisma/generated/prisma-client/client";

dotenv.config();

const isWindows = process.platform === "win32";
const isDocker = process.env.DOCKER_ENV === "true";

export type IUser = User;

const getDatabaseUrl = (): string => {
    if (isWindows) {
        return "file:./prisma/database-sql-lite.db";
    }

    if (isDocker) {
        return `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`;
    }

    return process.env.DATABASE_URL || "file:./prisma/database-sql-lite.db";
};

const DB_URL = getDatabaseUrl();

console.log(`Using database URL: ${DB_URL.replace(/:([^:]+)@/, ":*****@")}`);

declare global {
    var prisma: PrismaClient | undefined;
}

const prismaClient = global.prisma ?? new PrismaClient({
    datasources: {
        db: {
            url: DB_URL,
        },
    },
    log: process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV !== "production") {
    global.prisma = prismaClient;
}

export default prismaClient;
