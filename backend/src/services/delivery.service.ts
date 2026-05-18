import { DeliveryRepository } from '../repositories/delivery.repository';
import { OrderRepository } from '../repositories/order.repository';
import { emitOrderStatusChange } from '../websocket/socket';

export class DeliveryService {
  private deliveryRepository: DeliveryRepository;
  private orderRepository: OrderRepository;

  constructor() {
    this.deliveryRepository = new DeliveryRepository();
    this.orderRepository = new OrderRepository();
  }

  async acceptDelivery(orderId: string, deliveryPersonId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado.');

    if (order.status === 'RECEIVED') {
      throw new Error('O restaurante ainda não começou a preparar este pedido.');
    }

    const existingDelivery = await this.deliveryRepository.findByOrderId(orderId);
    if (existingDelivery) throw new Error('Esta entrega já foi aceita por outro entregador.');

    // 1. Cria a corrida vinculando ao entregador
    const delivery = await this.deliveryRepository.create({
      orderId,
      deliveryPersonId,
      acceptedAt: new Date(),
    });

    return delivery;
  }

  async pickUpDelivery(orderId: string, deliveryPersonId: string) {
    const delivery = await this.deliveryRepository.findByOrderId(orderId);
    if (!delivery) throw new Error('Entrega não encontrada.');
    if (delivery.deliveryPersonId !== deliveryPersonId) throw new Error('Acesso negado: Esta entrega não é sua.');
    if (delivery.pickedUpAt) throw new Error('Esta entrega já foi retirada.');

    const order = await this.orderRepository.findById(orderId);
    if (order?.status !== 'READY_FOR_PICKUP') {
      throw new Error('Calma! O restaurante ainda não marcou este pedido como "Pronto para Retirada".');
    }

    await this.deliveryRepository.markAsPickedUp(delivery.id);
    await this.orderRepository.updateStatus(orderId, 'ON_THE_WAY');
    emitOrderStatusChange(orderId, 'ON_THE_WAY'); // Só avisa o cliente agora!

    return delivery;
  }

  async markAsDelivered(orderId: string, deliveryPersonId: string, verificationCode: string) {
    const delivery = await this.deliveryRepository.findByOrderId(orderId);
    if (!delivery) throw new Error('Entrega não encontrada.');
    if (delivery.deliveryPersonId !== deliveryPersonId) throw new Error('Acesso negado: Esta entrega não é sua.');
    if (delivery.deliveredAt) throw new Error('Esta entrega já foi finalizada.');
    if (!delivery.pickedUpAt) throw new Error('Você precisa retirar o pedido no restaurante primeiro.');

    const order = await this.orderRepository.findById(orderId);
    if (order?.verificationCode !== verificationCode) {
      throw new Error('Código de verificação incorreto.');
    }

    await this.deliveryRepository.markAsDelivered(delivery.id);
    await this.orderRepository.updateStatus(orderId, 'DELIVERED');
    emitOrderStatusChange(orderId, 'DELIVERED');

    return delivery;
  }

  async listMyDeliveries(deliveryPersonId: string) {
    return this.deliveryRepository.findActiveDeliveriesByPerson(deliveryPersonId);
  }

  async getMyDeliveryHistory(deliveryPersonId: string) {
    return this.deliveryRepository.findDeliveryHistoryByPerson(deliveryPersonId);
  }

  async getAvailableDeliveries() {
    return this.orderRepository.findAvailableForDelivery();
  }
}