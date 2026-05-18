import { prisma } from '../prisma';
import { Prisma, Category, Product } from '@prisma/client';

export class MenuRepository {
  async createCategory(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async createProduct(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  async getMenuByRestaurantId(restaurantId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { restaurantId },
      include: {
        products: true, // Magia do Prisma: Traz a lista de produtos atrelada a cada categoria!
      },
    });
  }

  // Busca múltiplos produtos usando o operador "in"
  async findProductsByIds(productIds: string[]): Promise<Product[]> {
    return prisma.product.findMany({ where: { id: { in: productIds } } });
  }

  async findProductById(productId: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id: productId } });
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }
}