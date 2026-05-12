import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CartRepository } from '../repositories/cart.repository';
import { OrderRepository } from '../repositories/order.repository';
import { NotificationController } from './notification.controller';


export class CartController {
  static async getCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const cart = await CartRepository.getCart(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { variantId, quantity } = req.body;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await CartRepository.addItem(userId, variantId, quantity);
      res.status(200).json({ success: true, message: 'Item added to cart' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
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

      res.status(201).json({ 
        success: true, 
        data: { 
          id: order.id, 
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount 
        } 
      });

      // Create dynamic notification for admin in background
      NotificationController.createNotification(
        'New Order Received',
        `Order #${order.orderNumber} placed for $${totalAmount}`,
        'SUCCESS',
        '/admin/dashboard?tab=orders'
      ).catch(e => console.error('BG Notification Error:', e));

    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(400).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  }

  static async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      console.log('Fetching orders for userId:', userId);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const orders = await OrderRepository.getUserOrders(userId);
      console.log(`Found ${orders.length} orders for user ${userId}`);
      res.status(200).json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
