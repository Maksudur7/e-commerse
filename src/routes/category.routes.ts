import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

// Only Admins can manage categories
router.post('/', authenticate, authorize('ADMIN'), CategoryController.create);
router.put('/:id', authenticate, authorize('ADMIN'), CategoryController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), CategoryController.delete);

export default router;
