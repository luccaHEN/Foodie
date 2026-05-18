import { z } from 'zod';

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
    description: z.string().optional(),
    address: z.string().min(5, 'O endereço é obrigatório.'),
    specialty: z.string().optional(),
  }),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>['body'];