import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { ReviewRepository } from '../repositories/review.repository';

export class AIController {
  static async generateDescription(req: Request, res: Response) {
    try {
      const { productName, category, features } = req.body;
      const description = await AIService.generateDescription(productName, category, features);
      res.status(200).json({ success: true, data: description });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async parseSearch(req: Request, res: Response) {
    try {
      const { query } = req.body;
      const filters = await AIService.parseSearchIntent(query);
      res.status(200).json({ success: true, data: filters });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getStylist(req: Request, res: Response) {
    try {
      const { productId, productName, category, style, priceRange } = req.body;
      const suggestions = await AIService.getStylistSuggestions({
        productId,
        productName,
        category,
        style,
        priceRange,
      });
      res.status(200).json({ success: true, data: suggestions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async summarizeReviews(req: Request, res: Response) {
    try {
      const productId = req.params.productId as string;
      const reviews = await ReviewRepository.findByProductId(productId);
      const summary = await AIService.summarizeReviews(reviews);
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async chatSupport(req: Request, res: Response) {
    try {
      const { query, context, messages } = req.body;

      // If multi-turn conversation with history
      if (messages && Array.isArray(messages)) {
        const reply = await AIService.chatWithMemory(messages, context);
        return res.status(200).json({ success: true, data: reply });
      }

      // Single turn chat
      const reply = await AIService.chatWithSupport(query, context);
      res.status(200).json({ success: true, data: reply });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
