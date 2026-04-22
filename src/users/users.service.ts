import type { User } from '@prisma/client';
import pkg from '@prisma/client';
const { PrismaClient, Prisma } = pkg;

const prisma = new PrismaClient();

export class UsersService {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}
