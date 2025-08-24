// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query", "error", "warn"], // optional
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map