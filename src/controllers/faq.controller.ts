import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class FAQController {
  static async getAll(req: Request, res: Response) {
    try {
      const faqs = await prisma.fAQ.findMany();
      res.status(200).json({ success: true, data: faqs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
