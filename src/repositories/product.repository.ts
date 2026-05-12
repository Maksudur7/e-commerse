import prisma from '../config/prisma';
import { Prisma, Product } from '@prisma/client';
import { slugify } from '../utils/slugify';

export class ProductRepository {
  static async create(data: any): Promise<Product> {
    const slug = slugify(data.name);
    
    const { categoryId, vendorId, ...restData } = data;

    return prisma.product.create({
      data: {
        ...restData,
        slug,
        category: {
          connect: { id: categoryId }
        },
        vendor: {
          connect: { id: vendorId }
        }
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
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { category, minPrice, maxPrice, search, isFeatured, sortBy, page = 1, limit = 10 } = filters as any;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

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

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'popular') {
      orderBy = {
        reviews: {
          _count: 'desc'
        }
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
        orderBy,
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

  static async update(id: string, data: any, vendorId?: string): Promise<Product> {
    const updateData: any = {};
    
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name);
    }
    if (data.description) updateData.description = data.description;
    if (data.basePrice) updateData.basePrice = data.basePrice;
    if (data.images) updateData.images = data.images;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.status) updateData.status = data.status;
    if (data.categoryId) {
      updateData.category = {
        connect: { id: data.categoryId }
      };
    }

    const where: any = { id };
    if (vendorId) {
      where.vendorId = vendorId;
    }

    return prisma.product.update({
      where,
      data: updateData,
      include: {
        category: true,
        variants: true,
      }
    });
  }

  static async addReview(productId: string, userId: string, rating: number, comment: string) {
    return prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        comment
      },
      include: {
        product: {
          select: { slug: true }
        }
      }
    });
  }
}

