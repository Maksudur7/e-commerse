import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class BlogController {
  static async getAll(req: Request, res: Response) {
    try {
      const blogs = await prisma.blog.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, data: blogs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const blog = await prisma.blog.findUnique({
        where: { slug }
      });
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }
      res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
