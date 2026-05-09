import prisma from '../config/prisma';
import { Prisma, Category } from '@prisma/client';
import { slugify } from '../utils/slugify';

export class CategoryRepository {
  static async create(data: { name: string; parentId?: string; image?: string }): Promise<Category> {
    const slug = slugify(data.name);
    return prisma.category.create({
      data: {
        name: data.name,
        slug,
        parentId: data.parentId,
        image: data.image,
      },
    });
  }

  static async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      include: {
        subCategories: true,
      },
    });
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        subCategories: true,
        products: true,
      },
    });
  }

  static async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  static async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}
