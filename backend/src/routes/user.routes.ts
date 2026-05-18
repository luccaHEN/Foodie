import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateData } from '../middlewares/validateData';
import { createUserSchema, updateProfileSchema } from '../schemas/user.schema';
import { loginSchema } from '../schemas/auth.schema';
import { authenticate } from '../middlewares/auth.middleware';

const userRoutes = Router();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento e Autenticação de Usuários
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, RESTAURANT, DELIVERY, ADMIN]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       409:
 *         description: Conflito - E-mail já cadastrado
 */
userRoutes.post('/register', validateData(createUserSchema), userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Realiza o login e retorna o Token JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
userRoutes.post('/login', validateData(loginSchema), userController.login);

// Rotas protegidas de usuário
userRoutes.patch('/profile', authenticate, validateData(updateProfileSchema), userController.updateProfile);

export { userRoutes };