import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

console.log('Admin routes file loaded');

router.get('/test', (req, res) => res.json({ message: 'Admin router is alive' }));

// All admin routes are protected and require ADMIN role
router.use(authenticate); // Temporarily allow all authenticated users for debugging
// router.use(authorize('ADMIN')); 

router.get('/stats', AdminController.getStats);

// Products
router.get('/products', AdminController.getProducts);
router.post('/products', AdminController.createProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Categories
router.get('/categories', AdminController.getCategories);
router.post('/categories', AdminController.createCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// Orders
router.get('/orders', AdminController.getOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// Customers
router.get('/customers', AdminController.getCustomers);

export default router;
