import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Forneça um e-mail válido.'),
    password: z.string().min(1, 'A senha é obrigatória.'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];