import prisma from '../config/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderRepository {
  static async createOrder(data: {
    userId: string;
    items: { variantId: string; quantity: number; price: number }[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: any;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Check and deduct stock for each item
      for (const item of data.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId }
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }

        // Deduct stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 2. Create Order
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          shippingAddress: data.shippingAddress,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { items: true }
      });

      // 3. Clear User's Cart
      const cart = await tx.cart.findUnique({ where: { userId: data.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return order;
    });
  }

  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { variant: { include: { product: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
}
