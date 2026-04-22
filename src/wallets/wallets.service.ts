import type { Wallet } from '@prisma/client';
import pkg from '@prisma/client';
const { PrismaClient, Prisma } = pkg;

const prisma = new PrismaClient();

export class WalletsService {
  async findAll(): Promise<Wallet[]> {
    return prisma.wallet.findMany();
  }

  async findOne(id: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.WalletCreateInput): Promise<Wallet> {
    return prisma.wallet.create({
      data,
    });
  }
}
