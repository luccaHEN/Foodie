import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.user!.id;
      const order = await this.orderService.create(req.body, customerId);
      res.status(201).json({ status: 'success', data: order });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('não foram encontrados') || error.message.includes('não pertence'))) {
        res.status(400).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  };

  listMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.user!.id;
      const orders = await this.orderService.listCustomerOrders(customerId);
      res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      next(error);
    }
  };

  listMyHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.user!.id;
      const orders = await this.orderService.listCustomerHistory(customerId);
      res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const orderId = req.params.orderId;
      const { status, verificationCode } = req.body;

      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do pedido inválido.' }); return;
      }

      const order = await this.orderService.updateStatus(orderId, status, ownerId, verificationCode);
      res.status(200).json({ status: 'success', data: order });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('incorreto')) {
          res.status(400).json({ status: 'error', message: error.message }); return;
        }
        if (error.message.includes('não encontrado')) {
          res.status(404).json({ status: 'error', message: error.message }); return;
        }
        if (error.message.includes('Acesso negado')) {
          res.status(403).json({ status: 'error', message: error.message }); return;
        }
      }
      next(error);
    }
  };

  listLiveOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const restaurantId = req.params.restaurantId;

      if (!restaurantId || typeof restaurantId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do restaurante inválido ou não fornecido.' });
        return;
      }

      const orders = await this.orderService.getRestaurantLiveOrders(restaurantId, ownerId);
      res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      next(error);
    }
  };

  listOrderHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const restaurantId = req.params.restaurantId;

      if (!restaurantId || typeof restaurantId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do restaurante inválido.' });
        return;
      }

      const orders = await this.orderService.getRestaurantOrderHistory(restaurantId, ownerId);
      res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      next(error);
    }
  };

  createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.user!.id;
      const orderId = req.params.orderId;

      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do pedido inválido.' }); return;
      }

      const review = await this.orderService.createReview(orderId, customerId, req.body);
      res.status(201).json({ status: 'success', data: review });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('não encontrado') || error.message.includes('negado') || error.message.includes('entregues') || error.message.includes('avaliado'))) {
        res.status(400).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.id;
      const senderRole = req.user!.role;
      const orderId = req.params.orderId;
      const { content } = req.body;

      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do pedido inválido.' }); return;
      }

      const message = await this.orderService.addMessageToOrder(orderId, senderId, senderRole as any, content);
      res.status(201).json({ status: 'success', data: message });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = req.params.orderId;
      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do pedido inválido.' }); return;
      }
      const messages = await this.orderService.getOrderMessages(orderId);
      res.status(200).json({ status: 'success', data: messages });
    } catch (error) {
      next(error);
    }
  };
}