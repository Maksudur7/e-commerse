import { Request, Response } from 'express';
import { CategoryRepository } from '../repositories/category.repository';

export class CategoryController {
  static async create(req: Request, res: Response) {
    try {
      const category = await CategoryRepository.create(req.body);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoryRepository.findAll();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const category = await CategoryRepository.findBySlug(slug);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await CategoryRepository.delete(id);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const category = await CategoryRepository.update(id, req.body);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
