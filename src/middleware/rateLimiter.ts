import { Request, Response, NextFunction } from 'express';

const rates: Record<string, { count: number; lastReset: number }> = {};

export const rateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rates[ip] || now - rates[ip].lastReset > windowMs) {
      rates[ip] = { count: 1, lastReset: now };
    } else {
      rates[ip].count++;
    }

    if (rates[ip].count > limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    next();
  };
};
