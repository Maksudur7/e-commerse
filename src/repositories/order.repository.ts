import prisma from '../config/prisma';
import { OrderStatus } from '@prisma/client';

export class OrderRepository {
  static async createOrder(data: {
    userId: string;
    items: { variantId: string; quantity: number; price: number }[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: any;
  }) {
    // Step 1: Validate stock for all items BEFORE creating the order
    for (const item of data.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId }
      });

      if (!variant) {
        throw new Error(`Product variant ${item.variantId} not found`);
      }
      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for product. Available: ${variant.stock}, Requested: ${item.quantity}`);
      }
    }

    // Step 2: Create the Order with all items (single atomic write)
    const order = await prisma.order.create({
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

    // Step 3: Deduct stock for each item (sequential, non-transactional)
    for (const item of data.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } }
      }).catch(err => {
        console.error(`Stock deduction failed for variant ${item.variantId}:`, err.message);
        // Order is already placed — stock deduction failure is non-fatal
      });
    }

    // Step 4: Clear the user's cart
    const cart = await prisma.cart.findUnique({ where: { userId: data.userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } }).catch(err => {
        console.error(`Cart clear failed for user ${data.userId}:`, err.message);
        // Non-fatal — order is saved
      });
    }

    return order;
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
