import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateData = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // O parseAsync vai disparar um ZodError se os dados forem inválidos
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error); // Encaminha o erro para o nosso errorHandler global
    }
  };
};