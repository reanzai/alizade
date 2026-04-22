import { PrismaClient, Prisma, Wallet } from '@prisma/client';

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
