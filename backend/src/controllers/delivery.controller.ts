import { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../services/delivery.service';

export class DeliveryController {
  private deliveryService: DeliveryService;

  constructor() {
    this.deliveryService = new DeliveryService();
  }

  accept = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deliveryPersonId = req.user!.id;
      const role = req.user!.role;

      // Camada vital de segurança: Bloqueia se não for um entregador!
      if (role !== 'DELIVERY') {
        res.status(403).json({ status: 'error', message: 'Acesso negado: Apenas entregadores podem aceitar corridas.' });
        return;
      }

      const orderId = req.params.orderId;
      
      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do pedido inválido ou não fornecido.' });
        return;
      }

      const delivery = await this.deliveryService.acceptDelivery(orderId, deliveryPersonId);
      res.status(201).json({ status: 'success', data: delivery });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('não encontrado') || error.message.includes('já foi aceita') || error.message.includes('preparar'))) {
        res.status(400).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  };

  pickUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deliveryPersonId = req.user!.id;
      if (req.user!.role !== 'DELIVERY') {
        res.status(403).json({ status: 'error', message: 'Acesso negado.' }); return;
      }

      const orderId = req.params.orderId;
      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do pedido inválido.' }); return;
      }

      const delivery = await this.deliveryService.pickUpDelivery(orderId, deliveryPersonId);
      res.status(200).json({ status: 'success', data: delivery });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Calma') || error.message.includes('negado'))) {
        res.status(400).json({ status: 'error', message: error.message }); return;
      }
      next(error);
    }
  };

  markAsDelivered = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deliveryPersonId = req.user!.id;
      if (req.user!.role !== 'DELIVERY') {
        res.status(403).json({ status: 'error', message: 'Acesso negado: Apenas entregadores.' });
        return;
      }

      const orderId = req.params.orderId;
      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ status: 'error', message: 'ID do pedido inválido.' });
        return;
      }

      const { verificationCode } = req.body;
      if (!verificationCode) {
        res.status(400).json({ status: 'error', message: 'Código de verificação obrigatório.' });
        return;
      }

      const delivery = await this.deliveryService.markAsDelivered(orderId, deliveryPersonId, verificationCode);
      res.status(200).json({ status: 'success', data: delivery });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('não encontrada') || error.message.includes('Acesso negado') || error.message.includes('finalizada') || error.message.includes('incorreto'))) {
        res.status(400).json({ status: 'error', message: error.message }); return;
      }
      next(error);
    }
  };

  listMyDeliveries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deliveryPersonId = req.user!.id;
      const deliveries = await this.deliveryService.listMyDeliveries(deliveryPersonId);
      res.status(200).json({ status: 'success', data: deliveries });
    } catch (error) {
      next(error);
    }
  };

  listMyHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deliveryPersonId = req.user!.id;
      const history = await this.deliveryService.getMyDeliveryHistory(deliveryPersonId);
      res.status(200).json({ status: 'success', data: history });
    } catch (error) {
      next(error);
    }
  };

  listAvailable = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const available = await this.deliveryService.getAvailableDeliveries();
      res.status(200).json({ status: 'success', data: available });
    } catch (error) {
      next(error);
    }
  };
}