import { PrismaClient } from '@prisma/client'

// 1. Đổi trực tiếp từ gốc để các file mới import { prisma } chạy mượt mà
export const prisma = new PrismaClient() 

// 2. Tạo một "bí danh" db trỏ vào prisma để code cũ không bị sập
export const db = prisma 

export { Prisma } from '@prisma/client'