import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';
import { authenticate } from '../middlewares/auth.middleware';

const deliveryRoutes = Router();
const deliveryController = new DeliveryController();

deliveryRoutes.use(authenticate);

deliveryRoutes.get('/available', deliveryController.listAvailable);
deliveryRoutes.get('/my-deliveries', deliveryController.listMyDeliveries);
deliveryRoutes.get('/my-history', deliveryController.listMyHistory);
deliveryRoutes.post('/:orderId/accept', deliveryController.accept);
deliveryRoutes.patch('/:orderId/pickup', deliveryController.pickUp);
deliveryRoutes.patch('/:orderId/deliver', deliveryController.markAsDelivered);

export { deliveryRoutes };