// fullstack/scripts/switch-db.js

const { copyFileSync } = require("fs");
const { platform } = require("os");
const path = require("path");

const schemaName = platform() === "win32" ? "sqlite" : "postgres";
const src = path.resolve(__dirname, `../prisma/schema.${schemaName}.temp`);
const dest = path.resolve(__dirname, `../prisma/schema.prisma`);

try {
    copyFileSync(src, dest);
    console.log(`✅ Switched Prisma schema to '${schemaName}' for platform '${platform()}'`);
} catch (err) {
    console.error("❌ Failed to switch schema:", err);
    process.exit(1);
}
