import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { type User, PrismaClient } from "../../prisma/generated/prisma-client/client";

export type IUser = User;

dotenv.config();

const isWindows = process.platform === "win32";
const isDocker = process.env.DOCKER_ENV === "true";
// const isProduction = process.env.NODE_ENV === "production";

// В ESM __dirname нужно определить вручную
const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);

const getDatabaseUrl = (): string => {
    // Используем SQLite на Windows, если явно не задан FORCE_POSTGRES
    if (isWindows && process.env.FORCE_POSTGRES !== "true") {
        // Используем абсолютный путь к файлу с базой данных
        // const dbPath = isProduction
        //     ? path.resolve(directoryName, "..", "..", "..", "prisma", "database-sql-lite.db")
        //     : path.resolve(directoryName, "..", "..", "prisma", "database-sql-lite.db");
        const dbPath = path.resolve(directoryName, "..", "..", "prisma", "database-sql-lite.db");

        return `file:${dbPath.replace(/\\/g, "/")}`;
    }

    // Используем PostgreSQL в Docker
    if (isDocker) {
        return `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}?schema=public`;
    }

    // В крайнем случае — из env или SQLite по умолчанию
    return process.env.DATABASE_URL as string; // || "file:./prisma/database-sql-lite.db";
};

const DB_URL = getDatabaseUrl();

const logUrl = DB_URL.includes("postgresql")
    ? DB_URL.replace(/:([^:]+)@/, ":*****@")
    : DB_URL;

console.log(
    "Database configuration:\n"
    + `  Environment: ${!isWindows ? "production" : "development"}\n`
    + `  Platform: ${isWindows ? "Windows" : "Non-Windows"}\n`
    + `  Docker: ${isDocker ? "yes" : "no"}\n`
    + `  DB Type: ${DB_URL.includes("postgresql") ? "Postgres" : "SQLite"}\n`
    + `  URL: ${logUrl}`,
);

declare global {
    // В следующий раз reuse готовый instance
    var prisma: PrismaClient | undefined;
}

const prismaOptions: any = {
    datasources: {
        db: { url: DB_URL },
    },
    log: isDocker
        ? [{ level: "error", emit: "stdout" }]
        : [
            { level: "query", emit: "event" },
            { level: "info", emit: "stdout" },
            { level: "warn", emit: "stdout" },
            { level: "error", emit: "stdout" },
        ],
} as const;

const prismaClient = global.prisma ?? new PrismaClient(prismaOptions);

// eslint-disable-next-line no-constant-condition
if (true) {
    global.prisma = prismaClient;

    prismaClient
        .$connect()
        .then(() => console.log("Database connection verified"))
        .catch((error) => {
            console.error("Database connection error!", error);
            process.exit(1);
        });
}

export default prismaClient;
