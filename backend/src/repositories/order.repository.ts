import { prisma } from '../prisma';
import { Prisma, Order, OrderStatus, Review, ChatMessage } from '@prisma/client';

export class OrderRepository {
  async createOrder(
    data: Prisma.OrderUncheckedCreateInput,
    items: Prisma.OrderItemUncheckedCreateWithoutOrderInput[]
  ): Promise<Order> {
    return prisma.order.create({
      data: {
        ...data,
        items: { create: items }, // Salva o pedido e os itens de uma vez só!
      },
      include: { items: true },
    });
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { customerId, status: { not: 'DELIVERED' } },
      include: { items: true, restaurant: true }, // Traz os detalhes do pedido
      orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
    });
  }

  async findHistoryByCustomer(customerId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { customerId, status: 'DELIVERED' },
      include: { items: { include: { product: true } }, restaurant: true, review: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({ where: { id }, data: { status } });
  }

  async findLiveOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { restaurantId, status: { notIn: ['DELIVERED'] } },
      include: { items: { include: { product: true } }, customer: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }, // Os mais antigos primeiro na fila
    });
  }

  async findAvailableForDelivery(): Promise<Order[]> {
    return prisma.order.findMany({
      where: { delivery: null, status: { in: ['PREPARING', 'READY_FOR_PICKUP'] }, deliveryMethod: 'DELIVERY' },
      include: { restaurant: true, customer: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOrderHistoryByRestaurant(restaurantId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { restaurantId },
      include: { items: { include: { product: true } }, customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReview(data: Prisma.ReviewUncheckedCreateInput): Promise<Review> {
    return prisma.review.create({ data });
  }

  async findReviewByOrderId(orderId: string): Promise<Review | null> {
    return prisma.review.findUnique({ where: { orderId } });
  }

  async createChatMessage(data: Prisma.ChatMessageUncheckedCreateInput): Promise<ChatMessage & { sender: { name: string } }> {
    return prisma.chatMessage.create({ data, include: { sender: { select: { name: true } } } });
  }

  async findMessagesByOrderId(orderId: string): Promise<(ChatMessage & { sender: { name: string } })[]> {
    return prisma.chatMessage.findMany({ where: { orderId }, include: { sender: { select: { name: true } } }, orderBy: { createdAt: 'asc' } });
  }
}