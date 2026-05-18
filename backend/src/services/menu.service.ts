import { MenuRepository } from '../repositories/menu.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { CreateCategoryInput, CreateProductInput, UpdateProductInput } from '../schemas/menu.schema';

export class MenuService {
  private menuRepository: MenuRepository;
  private restaurantRepository: RestaurantRepository;

  constructor() {
    this.menuRepository = new MenuRepository();
    this.restaurantRepository = new RestaurantRepository();
  }

  // Função reutilizável para garantir a segurança da operação
  private async validateRestaurantOwnership(restaurantId: string, ownerId: string) {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurante não encontrado.');
    }
    if (restaurant.ownerId !== ownerId) {
      throw new Error('Acesso negado: Você não é o dono deste restaurante.');
    }
  }

  async createCategory(data: CreateCategoryInput, ownerId: string) {
    await this.validateRestaurantOwnership(data.restaurantId, ownerId);
    return this.menuRepository.createCategory(data);
  }

  async createProduct(data: CreateProductInput, ownerId: string) {
    await this.validateRestaurantOwnership(data.restaurantId, ownerId);
    return this.menuRepository.createProduct({
      name: data.name,
      price: data.price,
      restaurantId: data.restaurantId,
      categoryId: data.categoryId,
      ...(data.description && { description: data.description }),
    });
  }

  async updateProduct(productId: string, data: UpdateProductInput, ownerId: string) {
    const product = await this.menuRepository.findProductById(productId);
    if (!product) throw new Error('Produto não encontrado.');

    await this.validateRestaurantOwnership(product.restaurantId, ownerId);

    return this.menuRepository.updateProduct(productId, {
      ...(data.name && { name: data.name }),
      ...(data.price && { price: data.price }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.description !== undefined && { description: data.description }),
    });
  }

  async deleteProduct(productId: string, ownerId: string) {
    const product = await this.menuRepository.findProductById(productId);
    if (!product) throw new Error('Produto não encontrado.');

    await this.validateRestaurantOwnership(product.restaurantId, ownerId);

    return this.menuRepository.deleteProduct(productId);
  }

  async getMenu(restaurantId: string) {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurante não encontrado.');
    
    return this.menuRepository.getMenuByRestaurantId(restaurantId);
  }
}