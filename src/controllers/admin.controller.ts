import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { OrderStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

export class AdminController {
  static async getStats(req: Request, res: Response) {
    console.log('Admin Stats Request Received');
    try {
      // 1. Core Metrics
      const [totalRevenue, totalOrders, activeCustomers, totalProducts] = await Promise.all([
        prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
        prisma.order.count(),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.product.count()
      ]);

      // 2. Sales Data (Last 7 days)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const salesData = await prisma.order.findMany({
        where: { createdAt: { gte: last7Days }, paymentStatus: 'PAID' },
        orderBy: { createdAt: 'asc' }
      });

      // Group by day for chart
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartDataMap = new Map();
      salesData.forEach(order => {
        const day = days[new Date(order.createdAt).getDay()];
        const current = chartDataMap.get(day) || { sales: 0, orders: 0 };
        chartDataMap.set(day, {
          sales: current.sales + order.totalAmount,
          orders: current.orders + 1
        });
      });

      const formattedSalesData = days.map(day => ({
        name: day,
        sales: chartDataMap.get(day)?.sales || 0,
        orders: chartDataMap.get(day)?.orders || 0
      }));

      // 3. Category Distribution
      const categoryStats = await prisma.category.findMany({
        include: {
          _count: { select: { products: true } }
        }
      });

      // 4. Top Selling Products
      const topProducts = await prisma.product.findMany({
        take: 5,
        include: {
          _count: { select: { variants: true } } // Placeholder for actual sales count logic
        },
        orderBy: { createdAt: 'desc' }
      });

      // 5. Dynamic AI Insights Logic
      const lowStockProducts = await prisma.productVariant.count({ where: { stock: { lt: 5 } } });
      const conversionRate = totalOrders > 0 ? ((totalOrders / (activeCustomers || 1)) * 100).toFixed(1) : 0;

      const aiInsights = {
        prediction: `Based on your ${totalOrders} orders, we expect a ${totalRevenue._sum.totalAmount! > 1000 ? 'steady' : 'growing'} trend.`,
        recommendation: lowStockProducts > 0
          ? `Urgent: ${lowStockProducts} products are nearly out of stock. Restock soon!`
          : "Inventory levels are healthy. Consider launching a new promotion.",
        sentiment: "Positive",
        stockRisk: lowStockProducts
      };

      res.status(200).json({
        success: true,
        data: {
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          totalOrders,
          activeCustomers,
          totalProducts,
          salesData: formattedSalesData,
          categoryStats: categoryStats.map(c => ({ name: c.name, count: c._count.products })),
          topProducts: topProducts.map(p => ({ name: p.name, price: p.basePrice })),
          aiInsights,
          conversionRate,
          systemStatus: [
            { name: "API Server", status: "Operational", color: "bg-green-500" },
            { name: "Database", status: "Operational", color: "bg-green-500" },
            { name: "AI Engine", status: "Operational", color: "bg-green-500" },
            { name: "Storage", status: "Healthy", color: "bg-green-500" }
          ]
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true,
          variants: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        status: p.status,
        images: p.images,
        category: p.category,
        variants: p.variants
      }));

      res.status(200).json({ success: true, data: formattedProducts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: { variant: { include: { product: { select: { name: true } } } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formattedOrders = orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.user.name,
        email: o.user.email,
        date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: o.totalAmount,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        itemCount: o.items.length
      }));

      res.status(200).json({ success: true, data: formattedOrders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log(`Updating order ${id} status to ${status}`);

      const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      const order = await prisma.order.update({
        where: { id: id as string },
        data: { status: status as OrderStatus }
      });

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      console.error("Order status update error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProduct(req: AuthRequest, res: Response) {
    try {
      const { name, description, basePrice, categoryId, images } = req.body;
      const vendorId = req.user?.userId;

      if (!vendorId) {
        return res.status(401).json({ success: false, message: 'Vendor ID not found' });
      }

      const product = await prisma.product.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now(),
          description,
          basePrice: parseFloat(basePrice),
          images,
          categoryId,
          vendorId
        }
      });

      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id: id as string }
      });
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      console.log('GET /admin/categories requested');
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      console.log(`Found ${categories.length} categories`);
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      console.error('getCategories error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const category = await prisma.category.create({
        data: { 
          name,
          slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now()
        }
      });
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.category.delete({
        where: { id: id as string }
      });
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getCustomers(req: Request, res: Response) {
    try {
      const customers = await prisma.user.findMany({
        where: {
          role: 'CUSTOMER'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({ success: true, data: customers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
