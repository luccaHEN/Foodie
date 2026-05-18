import { z } from 'zod';
import { OrderStatus, DeliveryMethod } from '@prisma/client';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid('ID do restaurante inválido.'),
    items: z.array(
      z.object({
        productId: z.string().uuid('ID do produto inválido.'),
        quantity: z.number().int().positive('A quantidade deve ser maior que zero.'),
      })
    ).min(1, 'O pedido deve ter pelo menos um item.'),
    deliveryMethod: z.nativeEnum(DeliveryMethod).optional(),
    deliveryAddress: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      message: 'Status do pedido inválido.',
    }),
    verificationCode: z.string().optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5, 'A nota deve ser entre 1 e 5.'),
    comment: z.string().optional(),
  }),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];

export const createChatMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'A mensagem não pode estar vazia.'),
  }),
});
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>['body'];