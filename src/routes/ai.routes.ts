import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public / Customer AI features
router.post('/search', AIController.parseSearch);
router.post('/stylist', AIController.getStylist);
router.get('/reviews/:productId/summary', AIController.summarizeReviews);
router.post('/chat', AIController.chatSupport);

// Admin / Vendor AI features
router.post('/generate-description', authenticate, authorize('ADMIN', 'VENDOR'), AIController.generateDescription);

export default router;
