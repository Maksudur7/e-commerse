import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { name, phone, avatar } = req.body;
      const user = await UserRepository.update(userId, { name, phone, avatar });
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAddresses(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await UserRepository.findById(userId);
      res.status(200).json({ success: true, addresses: user?.address || [] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await UserRepository.findById(userId);
      const currentAddresses = (user?.address as any[]) || [];
      const newAddress = { id: Math.random().toString(36).substr(2, 9), ...req.body };
      
      const updatedUser = await UserRepository.update(userId, {
        address: [...currentAddresses, newAddress]
      });
      
      res.status(200).json({ success: true, addresses: updatedUser.address });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
