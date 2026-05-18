import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const restaurantId = req.params.restaurantId;

      if (!restaurantId || typeof restaurantId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do restaurante inválido.' });
        return;
      }

      const metrics = await this.dashboardService.getRestaurantDashboard(restaurantId, ownerId);
      res.status(200).json({ status: 'success', data: metrics });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Restaurante não encontrado.') {
          res.status(404).json({ status: 'error', message: error.message }); return;
        }
        if (error.message.includes('Acesso negado')) {
          res.status(403).json({ status: 'error', message: error.message }); return;
        }
      }
      next(error);
    }
  };
}