import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', ProductController.getAll);
router.get('/:slug', ProductController.getBySlug);

// Protected routes (Vendors and Admins)
router.post('/', authenticate, authorize('VENDOR', 'ADMIN'), ProductController.create);
router.put('/:id', authenticate, authorize('VENDOR', 'ADMIN'), ProductController.update);
router.delete('/:id', authenticate, authorize('VENDOR', 'ADMIN'), ProductController.delete);

// Review routes (Authenticated users)
router.post('/:id/reviews', authenticate, ProductController.createReview);

export default router;

