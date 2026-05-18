import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome da categoria deve ter no mínimo 2 caracteres.'),
    restaurantId: z.string().uuid('ID do restaurante inválido.'),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome do produto deve ter no mínimo 2 caracteres.'),
    description: z.string().optional(),
    price: z.number().positive('O preço deve ser maior que zero.'),
    restaurantId: z.string().uuid('ID do restaurante inválido.'),
    categoryId: z.string().uuid('ID da categoria inválido.'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome do produto deve ter no mínimo 2 caracteres.').optional(),
    description: z.string().optional(),
    price: z.number().positive('O preço deve ser maior que zero.').optional(),
    categoryId: z.string().uuid('ID da categoria inválido.').optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];