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

import { rateLimiter } from './middleware/rateLimiter';

import { initMonitoring, logError, logMessage } from './utils/monitoring';

dotenv.config();

// Initialize monitoring
initMonitoring();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(compression()); // Compress all responses
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Enhanced Helmet configuration for CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://i.ibb.co"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:5000", "https://api.gemini.google.com"]
    },
  },
}));
app.use(morgan('dev'));

// Global Rate Limiter: 100 requests per 15 minutes
app.use('/api', rateLimiter(100, 15 * 60 * 1000));

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

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ShopEase AI Backend is running' });
});

// Error Handling Middleware (Sentry Integration)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError(err, { url: req.url, method: req.method });
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  logMessage(`🚀 Server running on http://localhost:${PORT}`);
});
