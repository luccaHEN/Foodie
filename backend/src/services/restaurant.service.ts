import { RestaurantRepository } from '../repositories/restaurant.repository';
import { CreateRestaurantInput } from '../schemas/restaurant.schema';

export class RestaurantService {
  private restaurantRepository: RestaurantRepository;

  constructor() {
    this.restaurantRepository = new RestaurantRepository();
  }

  async create(data: CreateRestaurantInput, ownerId: string) {
    const restaurant = await this.restaurantRepository.create({
      name: data.name,
      address: data.address,
      ownerId: ownerId,
      ...(data.description && { description: data.description }), // Proteção estrita do TS
      ...(data.specialty && { specialty: data.specialty }),
    });
    return restaurant;
  }

  async listAll(search?: string, page: number = 1, limit: number = 10, specialty?: string) {
    return this.restaurantRepository.findAll(search, page, limit, specialty);
  }
}