import { prisma } from '../prisma';
import { Delivery, Prisma } from '@prisma/client';

export class DeliveryRepository {
  async findByOrderId(orderId: string): Promise<Delivery | null> {
    return prisma.delivery.findUnique({ where: { orderId } });
  }

  async create(data: Prisma.DeliveryUncheckedCreateInput): Promise<Delivery> {
    return prisma.delivery.create({ data });
  }

  async findActiveDeliveriesByPerson(deliveryPersonId: string) {
    return prisma.delivery.findMany({
      where: { deliveryPersonId, deliveredAt: null },
      include: { order: { include: { restaurant: true, customer: { select: { name: true, email: true } } } } },
    });
  }

  async findDeliveryHistoryByPerson(deliveryPersonId: string) {
    return prisma.delivery.findMany({
      where: { deliveryPersonId, deliveredAt: { not: null } },
      include: { order: { include: { restaurant: true, customer: { select: { name: true, email: true } } } } },
      orderBy: { deliveredAt: 'desc' },
    });
  }

  async markAsPickedUp(id: string): Promise<Delivery> {
    return prisma.delivery.update({
      where: { id },
      data: { pickedUpAt: new Date() },
    });
  }

  async markAsDelivered(id: string): Promise<Delivery> {
    return prisma.delivery.update({
      where: { id },
      data: { deliveredAt: new Date() },
    });
  }
}