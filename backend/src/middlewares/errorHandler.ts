import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[Error] ${err.name}: ${err.message}`);

  // 1. Tratamento de Erros de Validação (Zod)
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Erro de validação dos dados fornecidos.',
      issues: err.issues.map((issue: ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // 2. Tratamento de Erros do Banco de Dados (Prisma)
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as Error & { code: string; meta?: Record<string, unknown> };
    // P2002: Erro de violação de restrição única (ex: e-mail já cadastrado)
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        status: 'error',
        message: 'Conflito de dados. Já existe um registro com este valor.',
        target: prismaError.meta?.target,
      });
      return;
    }
    
    // P2025: Erro de registro não encontrado (ex: tentar atualizar um ID deletado)
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'Registro não encontrado no banco de dados.',
      });
      return;
    }

    // P2003: Erro de violação de chave estrangeira (ex: tentar deletar um produto já pedido)
    if (prismaError.code === 'P2003') {
      res.status(400).json({
        status: 'error',
        message: 'Não é possível excluir este registro pois ele está vinculado a outros dados (ex: pedidos antigos).',
      });
      return;
    }
  }

  // 3. Erros Genéricos e Inesperados
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor.',
  });
}