import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All admin routes are protected and require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/products', AdminController.getProducts);
router.get('/orders', AdminController.getOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);
router.get('/customers', AdminController.getCustomers);

export default router;
