import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
    email: z.string().email('Forneça um e-mail válido.'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    // O enum Role vem direto do Prisma para garantir que só aceitaremos valores válidos no banco
    role: z.nativeEnum(Role).optional(),
  }),
});

// Exportamos o tipo TypeScript inferido para usarmos no Service
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.').optional(),
    address: z.string().min(5, 'O endereço deve ter no mínimo 5 caracteres.').optional(),
    phone: z.string().min(8, 'Informe um telefone válido.').optional(),
  }),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];