import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | undefined;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' }, // Permite acesso de qualquer frontend (ajustar em produção)
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Novo cliente conectado: ${socket.id}`);

    // Cliente do app solicita para entrar na sala exclusiva do pedido dele
    socket.on('joinOrderRoom', (orderId: string) => {
      socket.join(`order_${orderId}`);
      console.log(`👥 Cliente ${socket.id} escutando o pedido: order_${orderId}`);
    });

    // Dono do restaurante solicita para entrar na sala do seu restaurante
    socket.on('joinRestaurantRoom', (restaurantId: string) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`👨‍🍳 Restaurante ${socket.id} escutando novos pedidos: restaurant_${restaurantId}`);
    });
  });
};

// Função isolada para disparar eventos de qualquer lugar do backend
export const emitOrderStatusChange = (orderId: string, status: string) => {
  if (io) io.to(`order_${orderId}`).emit('orderStatusUpdated', { orderId, status });
};

// Dispara evento quando um novo pedido chega para o restaurante
export const emitNewOrderToRestaurant = (restaurantId: string, order: any) => {
  if (io) io.to(`restaurant_${restaurantId}`).emit('newOrderReceived', order);
};

// Dispara evento de nova mensagem no chat do pedido
export const emitNewChatMessage = (orderId: string, message: any) => {
  if (io) io.to(`order_${orderId}`).emit('newChatMessage', message);
};