import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.get('/addresses', authenticate, UserController.getAddresses);
router.post('/addresses', authenticate, UserController.addAddress);
router.put('/addresses/:id', authenticate, UserController.updateAddress);
router.delete('/addresses/:id', authenticate, UserController.deleteAddress);

export default router;
