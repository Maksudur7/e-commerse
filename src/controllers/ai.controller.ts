import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { ProductRepository } from '../repositories/product.repository';

export class AIController {
  static async generateDescription(req: Request, res: Response) {
    try {
      const { productName, category, features } = req.body;
      const description = await AIService.generateDescription(productName, category, features);
      res.status(200).json({ status: 'success', data: description });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async smartSearch(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ message: 'Query is required' });

      // 1. Let AI parse the intent
      const filters = await AIService.parseSearchIntent(query as string);
      
      // 2. Use our existing ProductRepository to find matching items
      const result = await ProductRepository.findAll({
        search: filters.search || (query as string),
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });

      res.status(200).json({ 
        status: 'success', 
        ai_parsed: filters,
        ...result 
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
