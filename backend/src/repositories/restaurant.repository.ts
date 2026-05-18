import { prisma } from '../prisma';
import { Prisma, Restaurant } from '@prisma/client';

export class RestaurantRepository {
  // Cria um novo restaurante
  async create(data: Prisma.RestaurantUncheckedCreateInput): Promise<Restaurant> {
    return prisma.restaurant.create({ data });
  }

  // Lista restaurantes com Busca e Paginação
  async findAll(search?: string, page: number = 1, limit: number = 10, specialty?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.RestaurantWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: Prisma.QueryMode.insensitive };
    }
    if (specialty) {
      where.specialty = specialty;
    }

    const [data, total] = await Promise.all([
      prisma.restaurant.findMany({ where, skip, take: limit, include: { reviews: { select: { rating: true } } } }),
      prisma.restaurant.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Busca um restaurante pelo ID
  async findById(id: string): Promise<Restaurant | null> {
    return prisma.restaurant.findUnique({ where: { id }, include: { reviews: { select: { rating: true } } } });
  }
}