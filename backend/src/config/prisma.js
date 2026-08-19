import { PrismaClient } from "@prisma/client";

// Cliente unico de Prisma para toda la app (evita agotar conexiones en --watch)
export const prisma = new PrismaClient();
