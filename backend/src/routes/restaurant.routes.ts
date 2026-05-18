import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';
import { validateData } from '../middlewares/validateData';
import { createRestaurantSchema } from '../schemas/restaurant.schema';
import { authenticate } from '../middlewares/auth.middleware';

const restaurantRoutes = Router();
const restaurantController = new RestaurantController();

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Gerenciamento de Restaurantes
 */

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Lista todos os restaurantes
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: Lista de restaurantes retornada com sucesso
 */
restaurantRoutes.get('/', restaurantController.list);

// Rotas Protegidas: Daqui para baixo, o usuário PRECISA estar logado
restaurantRoutes.use(authenticate);

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Cria um novo restaurante
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurante criado com sucesso
 *       401:
 *         description: Não autorizado - Token ausente ou inválido
 */
restaurantRoutes.post('/', validateData(createRestaurantSchema), restaurantController.create);

export { restaurantRoutes };