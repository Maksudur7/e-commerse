import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, WishlistController.getWishlist);
router.post('/toggle', authenticate, WishlistController.toggleWishlist);

export default router;
