import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.register(req.body);
      res.status(201).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'E-mail já cadastrado.') {
        res.status(409).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.login(req.body);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Credenciais inválidas.') {
        res.status(401).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const updatedUser = await this.userService.updateProfile(userId, req.body);
      res.status(200).json({ status: 'success', data: updatedUser });
    } catch (error) {
      next(error);
    }
  };
}