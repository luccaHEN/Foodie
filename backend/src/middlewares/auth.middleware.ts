import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estende a tipagem global do Request do Express para aceitarmos o "req.user"
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Token não fornecido ou formato inválido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Token não fornecido no cabeçalho.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as unknown as { id: string; role: string };

    // Anexa as informações decodificadas ao objeto da requisição
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next(); // Permite que a requisição siga para o Controller
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Token inválido ou expirado.' });
  }
};