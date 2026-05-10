import prisma from '../config/prisma';
import { ProductVariant } from '@prisma/client';

export class ProductVariantRepository {
  static async create(data: any): Promise<ProductVariant> {
    return prisma.productVariant.create({
      data,
    });
  }

  static async findByProductId(productId: string): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany({
      where: { productId },
    });
  }

  static async updateStock(id: string, quantity: number): Promise<ProductVariant> {
    return prisma.productVariant.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  static async delete(id: string): Promise<ProductVariant> {
    return prisma.productVariant.delete({
      where: { id },
    });
  }
}
