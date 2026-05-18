import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateData } from '../middlewares/validateData';
import { createOrderSchema, updateOrderStatusSchema, createReviewSchema, createChatMessageSchema } from '../schemas/order.schema';
import { authenticate } from '../middlewares/auth.middleware';

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.use(authenticate); // Todas as rotas de pedido exigem usuário logado

orderRoutes.post('/', validateData(createOrderSchema), orderController.create);
orderRoutes.get('/my-orders', orderController.listMyOrders);
orderRoutes.get('/my-history', orderController.listMyHistory);
orderRoutes.post('/:orderId/review', validateData(createReviewSchema), orderController.createReview);
orderRoutes.post('/:orderId/chat', validateData(createChatMessageSchema), orderController.sendMessage);
orderRoutes.get('/:orderId/chat', orderController.getMessages);

// Rotas para o Restaurante gerenciar a fila de pedidos
orderRoutes.get('/restaurant/:restaurantId/live', orderController.listLiveOrders);
orderRoutes.get('/restaurant/:restaurantId/history', orderController.listOrderHistory);
orderRoutes.patch('/:orderId/status', validateData(updateOrderStatusSchema), orderController.updateStatus);

export { orderRoutes };