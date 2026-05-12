import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

console.log('Admin routes file loaded');

router.get('/test', (req, res) => res.json({ message: 'Admin router is alive' }));

// TEST: Put this route ABOVE auth to see if it's an auth issue
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// All admin routes are protected and require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/products', AdminController.getProducts);
router.get('/orders', AdminController.getOrders);
router.get('/customers', AdminController.getCustomers);

export default router;
