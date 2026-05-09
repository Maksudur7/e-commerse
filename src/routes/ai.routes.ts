import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public smart search
router.get('/smart-search', AIController.smartSearch);

// Only vendors/admins can generate content
router.post('/generate-description', authenticate, authorize('VENDOR', 'ADMIN'), AIController.generateDescription);

export default router;
