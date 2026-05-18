import { prisma } from '../prisma';
import { Prisma, User } from '@prisma/client';

export class UserRepository {
  // Busca um usuário pelo e-mail
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  // Cria um novo usuário no banco
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}