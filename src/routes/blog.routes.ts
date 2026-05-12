import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';

const router = Router();

router.get('/', BlogController.getAll);
router.get('/:slug', BlogController.getBySlug);

export default router;
