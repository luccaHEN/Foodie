import { DashboardRepository } from '../repositories/dashboard.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';

export class DashboardService {
  private dashboardRepository: DashboardRepository;
  private restaurantRepository: RestaurantRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
    this.restaurantRepository = new RestaurantRepository();
  }

  async getRestaurantDashboard(restaurantId: string, ownerId: string) {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    
    if (!restaurant) throw new Error('Restaurante não encontrado.');
    
    if (restaurant.ownerId !== ownerId) {
      throw new Error('Acesso negado: Você não é o dono deste restaurante.');
    }

    return this.dashboardRepository.getMetrics(restaurantId);
  }
}