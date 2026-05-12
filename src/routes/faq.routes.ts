import { Router } from 'express';
import { FAQController } from '../controllers/faq.controller';

const router = Router();

router.get('/', FAQController.getAll);

export default router;
