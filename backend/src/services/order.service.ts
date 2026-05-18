import { OrderRepository } from '../repositories/order.repository';
import { MenuRepository } from '../repositories/menu.repository';
import { RestaurantRepository } from '../repositories/restaurant.repository';
import { CreateOrderInput, CreateReviewInput, CreateChatMessageInput } from '../schemas/order.schema';
import { emitNewOrderToRestaurant, emitOrderStatusChange, emitNewChatMessage } from '../websocket/socket';
import { OrderStatus } from '@prisma/client';

export class OrderService {
  private orderRepository: OrderRepository;
  private menuRepository: MenuRepository;
  private restaurantRepository: RestaurantRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.menuRepository = new MenuRepository();
    this.restaurantRepository = new RestaurantRepository();
  }

  async create(data: CreateOrderInput, customerId: string) {
    const productIds = data.items.map((item) => item.productId);
    const products = await this.menuRepository.findProductsByIds(productIds);

    if (products.length !== productIds.length) {
      throw new Error('Um ou mais produtos não foram encontrados.');
    }

    let totalAmount = 0;

    // Monta os itens do pedido com o preço real extraído do banco de dados
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;

      if (product.restaurantId !== data.restaurantId) {
        throw new Error(`O produto '${product.name}' não pertence a este restaurante.`);
      }

      totalAmount += product.price * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Congela o preço no momento da compra
      };
    });

    // Gera um PIN de 4 dígitos aleatório (ex: "4829")
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await this.orderRepository.createOrder(
      { 
        customerId, 
        restaurantId: data.restaurantId, 
        totalAmount, 
        deliveryMethod: data.deliveryMethod || 'DELIVERY', 
        ...(data.deliveryAddress && { deliveryAddress: data.deliveryAddress }),
        verificationCode 
      },
      orderItems
    );

    // Dispara evento em tempo real para o painel do restaurante!
    emitNewOrderToRestaurant(data.restaurantId, order);

    return order;
  }

  async listCustomerOrders(customerId: string) {
    return this.orderRepository.findByCustomer(customerId);
  }

  async listCustomerHistory(customerId: string) {
    return this.orderRepository.findHistoryByCustomer(customerId);
  }

  async updateStatus(orderId: string, status: OrderStatus, ownerId: string, verificationCode?: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado.');

    const restaurant = await this.restaurantRepository.findById(order.restaurantId);
    if (restaurant?.ownerId !== ownerId) throw new Error('Acesso negado: Você não é o dono deste restaurante.');

    if (status === 'DELIVERED' && order.verificationCode !== verificationCode) {
      throw new Error('Código de verificação incorreto.');
    }

    const updatedOrder = await this.orderRepository.updateStatus(orderId, status);
    emitOrderStatusChange(orderId, status); // Avisa o cliente na mesma hora
    return updatedOrder;
  }

  async getRestaurantLiveOrders(restaurantId: string, ownerId: string) {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (restaurant?.ownerId !== ownerId) throw new Error('Acesso negado: Você não é o dono deste restaurante.');
    return this.orderRepository.findLiveOrdersByRestaurant(restaurantId);
  }

  async getRestaurantOrderHistory(restaurantId: string, ownerId: string) {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (restaurant?.ownerId !== ownerId) throw new Error('Acesso negado: Você não é o dono deste restaurante.');
    return this.orderRepository.findOrderHistoryByRestaurant(restaurantId);
  }

  async createReview(orderId: string, customerId: string, data: CreateReviewInput) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado.');
    if (order.customerId !== customerId) throw new Error('Acesso negado: Este pedido não é seu.');
    if (order.status !== 'DELIVERED') throw new Error('Você só pode avaliar pedidos que já foram entregues.');

    const existingReview = await this.orderRepository.findReviewByOrderId(orderId);
    if (existingReview) throw new Error('Este pedido já foi avaliado.');

    return this.orderRepository.createReview({
      orderId,
      customerId,
      restaurantId: order.restaurantId,
      rating: data.rating,
      ...(data.comment !== undefined && { comment: data.comment }),
    });
  }

  async addMessageToOrder(orderId: string, senderId: string, senderRole: any, content: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado.');

    // Salva a mensagem
    const message = await this.orderRepository.createChatMessage({
      orderId,
      senderId,
      role: senderRole,
      content,
    });

    emitNewChatMessage(orderId, message);
    return message;
  }

  async getOrderMessages(orderId: string) {
    return this.orderRepository.findMessagesByOrderId(orderId);
  }
}