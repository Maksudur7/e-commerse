import { Router } from 'express';
import { CartController, OrderController } from '../controllers/cart_order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Cart Routes
router.get('/cart', authenticate, CartController.getCart);
router.post('/cart/add', authenticate, CartController.addItem);

// Order Routes
router.post('/orders', authenticate, OrderController.placeOrder);
router.get('/orders/me', authenticate, OrderController.getMyOrders);

export default router;
