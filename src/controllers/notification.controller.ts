import { Request, Response } from 'express';
import prisma from '../config/prisma';


export class NotificationController {
  /**
   * Get all notifications for admin
   */
  static async getNotifications(req: Request, res: Response) {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.notification.update({
        where: { id: id as string },
        data: { isRead: true }
      });


      return res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        error: error.message
      });
    }
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(req: Request, res: Response) {
    try {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update notifications',
        error: error.message
      });
    }
  }

  /**
   * Helper to create a notification (internal use)
   */
  static async createNotification(title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO', link?: string) {
    try {
      await prisma.notification.create({
        data: { title, message, type, link }
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}
