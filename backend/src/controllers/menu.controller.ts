import { Request, Response, NextFunction } from 'express';
import { MenuService } from '../services/menu.service';

export class MenuController {
  private menuService: MenuService;

  constructor() {
    this.menuService = new MenuService();
  }

  // Helper privado para lidar com os erros de negócio padronizados do Menu
  private handleMenuError(error: unknown, res: Response, next: NextFunction) {
    if (error instanceof Error) {
      if (error.message === 'Restaurante não encontrado.') {
        res.status(404).json({ status: 'error', message: error.message });
        return;
      }
      if (error.message.includes('Acesso negado')) {
        res.status(403).json({ status: 'error', message: error.message });
        return;
      }
    }
    next(error);
  }

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const category = await this.menuService.createCategory(req.body, ownerId);
      res.status(201).json({ status: 'success', data: category });
    } catch (error) {
      this.handleMenuError(error, res, next);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const product = await this.menuService.createProduct(req.body, ownerId);
      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      this.handleMenuError(error, res, next);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const productId = req.params.productId;

      if (!productId || typeof productId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do produto inválido ou não fornecido.' });
        return;
      }

      const product = await this.menuService.updateProduct(productId, req.body, ownerId);
      res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      if (error instanceof Error && error.message === 'Produto não encontrado.') {
        res.status(404).json({ status: 'error', message: error.message }); return;
      }
      this.handleMenuError(error, res, next);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const productId = req.params.productId;

      if (!productId || typeof productId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do produto inválido ou não fornecido.' });
        return;
      }

      await this.menuService.deleteProduct(productId, ownerId);
      res.status(200).json({ status: 'success', message: 'Produto deletado com sucesso.' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Produto não encontrado.') {
        res.status(404).json({ status: 'error', message: error.message }); return;
      }
      this.handleMenuError(error, res, next);
    }
  };

  getMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurantId = req.params.restaurantId;
      
      if (!restaurantId || typeof restaurantId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do restaurante inválido ou não fornecido.' });
        return;
      }

      const menu = await this.menuService.getMenu(restaurantId);
      res.status(200).json({ status: 'success', data: menu });
    } catch (error) {
      this.handleMenuError(error, res, next);
    }
  };
}