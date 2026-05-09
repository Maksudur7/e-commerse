import prisma from '../config/prisma';
import { Prisma, Product } from '@prisma/client';
import { slugify } from '../utils/slugify';

export class ProductRepository {
  static async create(data: any): Promise<Product> {
    const slug = slugify(data.name);
    return prisma.product.create({
      data: {
        ...data,
        slug,
      },
      include: {
        category: true,
        variants: true,
      }
    });
  }

  static async findAll(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.variants = {
        some: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          _count: { select: { reviews: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        vendor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        }
      },
    });
  }

  static async delete(id: string, vendorId: string) {
    return prisma.product.deleteMany({
      where: { id, vendorId },
    });
  }
}
