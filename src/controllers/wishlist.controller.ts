import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class WishlistController {
  static async toggleWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { productId, image } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }

      const existing = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });

      if (existing) {
        await prisma.wishlist.delete({
          where: { id: existing.id }
        });
        return res.status(200).json({ success: true, message: 'Removed from wishlist', action: 'REMOVED' });
      } else {
        await prisma.wishlist.create({
          data: { userId, productId, image: image || null }
        });
        return res.status(201).json({ success: true, message: 'Added to wishlist', action: 'ADDED' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const wishlist = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              category: true,
              variants: true
            }
          }
        }
      });

      const products = wishlist.map((item: any) => ({
        ...item.product,
        wishlistImage: item.image, // Passed from the Wishlist schema
      }));

      res.status(200).json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
