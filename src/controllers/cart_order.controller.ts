import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CartRepository } from '../repositories/cart.repository';
import { OrderRepository } from '../repositories/order.repository';

export class CartController {
  static async getCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const cart = await CartRepository.getCart(userId);
      res.status(200).json({ status: 'success', data: cart });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async addItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { variantId, quantity } = req.body;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await CartRepository.addToCart(userId, variantId, quantity);
      res.status(200).json({ status: 'success', message: 'Item added to cart' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export class OrderController {
  static async placeOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { items, totalAmount, paymentMethod, shippingAddress } = req.body;

      const order = await OrderRepository.createOrder({
        userId,
        items,
        totalAmount,
        paymentMethod,
        shippingAddress
      });

      res.status(201).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  static async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const orders = await OrderRepository.getUserOrders(userId);
      res.status(200).json({ status: 'success', data: orders });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
