import prisma from '../config/prisma';
import { Review } from '@prisma/client';

export class ReviewRepository {
  static async create(data: { productId: string; userId: string; rating: number; comment: string }): Promise<Review> {
    return prisma.review.create({
      data,
    });
  }

  static async findByProductId(productId: string): Promise<Review[]> {
    return prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAverageRating(productId: string) {
    const aggregate = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });
    return {
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.id,
    };
  }
}
