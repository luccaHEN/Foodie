import { prisma } from '../prisma';

export class DashboardRepository {
  async getMetrics(restaurantId: string) {
    // 1. Total de pedidos
    const totalOrders = await prisma.order.count({
      where: { restaurantId },
    });

    // 2. Faturamento Total (Soma de todos os pedidos)
    const revenueResult = await prisma.order.aggregate({
      where: { restaurantId },
      _sum: { totalAmount: true },
    });

    // 3. Contagem de pedidos agrupados por Status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { restaurantId },
      _count: { id: true },
    });

    return {
      totalOrders,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      ordersByStatus,
    };
  }
}