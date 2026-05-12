import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';
import hpp from 'hpp';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import cartOrderRoutes from './routes/cart_order.routes';
import aiRoutes from './routes/ai.routes';
import userRoutes from './routes/user.routes';
import blogRoutes from './routes/blog.routes';
import faqRoutes from './routes/faq.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import wishlistRoutes from './routes/wishlist.routes';
import prisma from './config/prisma';
import { AuthService } from './services/auth.service';



import { rateLimiter } from './middleware/rateLimiter';

import { initMonitoring, logError, logMessage } from './utils/monitoring';

dotenv.config();

// Initialize monitoring
initMonitoring();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(compression()); // Compress all responses
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true
}));


// Enhanced Helmet configuration for CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://i.ibb.co", "https://res.cloudinary.com", "https://cdn.shopease.com", "https://*.cloudinary.com", "https://lh3.googleusercontent.com", "https://avatars.githubusercontent.com", "https://*.unsplash.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:5000", "https://api.gemini.google.com"]
    },
  },
}));
app.use(morgan('dev'));

// Global Rate Limiter: 5000 requests per 15 minutes
app.use('/api', rateLimiter(5000, 15 * 60 * 1000));


// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart-orders', cartOrderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);



// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ShopEase AI Backend is running' });
});

// ============ TEMPORARY DEBUG ROUTES (remove after fix) ============
// Check who the current token belongs to
app.get('/api/debug/me', async (req: any, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  const decoded = AuthService.verifyToken(token);
  if (!decoded) return res.json({ error: 'Invalid token' });
  const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, role: true } });
  res.json({ tokenPayload: decoded, dbUser: user });
});

// List all orders with the user they belong to
app.get('/api/debug/orders', async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, email: true } }, items: true }
  });
  res.json({ total: orders.length, orders: orders.map(o => ({ id: o.id, orderNumber: o.orderNumber, userId: o.userId, userEmail: o.user?.email, totalAmount: o.totalAmount, status: o.status, itemCount: o.items.length })) });
});
// ============ END TEMPORARY DEBUG ROUTES ============


// Error Handling Middleware (Sentry Integration)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError(err, { url: req.url, method: req.method });
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  logMessage(`🚀 Server running on http://localhost:${PORT}`);
});

