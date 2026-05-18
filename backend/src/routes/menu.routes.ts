import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { validateData } from '../middlewares/validateData';
import { createCategorySchema, createProductSchema, updateProductSchema } from '../schemas/menu.schema';
import { authenticate } from '../middlewares/auth.middleware';

const menuRoutes = Router();
const menuController = new MenuController();

// Rota Pública: Listar cardápio (categorias e seus produtos)
menuRoutes.get('/:restaurantId', menuController.getMenu);

// Rotas Protegidas
menuRoutes.use(authenticate);

menuRoutes.post('/categories', validateData(createCategorySchema), menuController.createCategory);
menuRoutes.post('/products', validateData(createProductSchema), menuController.createProduct);
menuRoutes.patch('/products/:productId', validateData(updateProductSchema), menuController.updateProduct);
menuRoutes.delete('/products/:productId', menuController.deleteProduct);

export { menuRoutes };