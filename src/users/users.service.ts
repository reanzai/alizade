import { PrismaClient, User, Prisma } from '@prisma/client';

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
