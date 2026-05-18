import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { userRoutes } from './routes/user.routes';
import { restaurantRoutes } from './routes/restaurant.routes';
import { menuRoutes } from './routes/menu.routes';
import { orderRoutes } from './routes/order.routes';
import { deliveryRoutes } from './routes/delivery.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { setupSwagger } from './config/swagger';

const app = express();

// Middlewares Base
app.use(cors());
app.use(express.json());

// Rotas de Health Check (Verificar se a API está online)
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date() });
});

// Rotas da Aplicação
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Documentação Swagger
setupSwagger(app);

// Middleware Global de Erros (DEVE ser o último middleware a ser registrado)
app.use(errorHandler);

export { app };