import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurant.service';

export class RestaurantController {
  private restaurantService: RestaurantService;

  constructor() {
    this.restaurantService = new RestaurantService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id; // Pego diretamente do Token JWT!
      const restaurant = await this.restaurantService.create(req.body, ownerId);

      res.status(201).json({
        status: 'success',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query.search as string | undefined;
      const specialty = req.query.specialty as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9; // 9 é um bom número para um grid 3x3

      const result = await this.restaurantService.listAll(search, page, limit, specialty);
      res.status(200).json({ status: 'success', data: result.data, meta: { page: result.page, totalPages: result.totalPages } });
    } catch (error) {
      next(error);
    }
  };
}