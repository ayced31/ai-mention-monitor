import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type { CreateBrandInput, UpdateBrandInput } from '../validations/brand.schema.js';

interface GetAllBrandsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export class BrandService {
  async getAll(userId: string, options: GetAllBrandsOptions = {}) {
    const { search, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { keywords: { has: search } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.brand.count({ where });

    // Get brands with pagination
    const brands = await prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { queries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return {
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(brandId: string, userId: string) {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        queries: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { queries: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    if (brand.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return brand;
  }

  async create(userId: string, data: CreateBrandInput) {
    const brand = await prisma.brand.create({
      data: {
        ...data,
        userId,
      },
      include: {
        _count: {
          select: { queries: true },
        },
      },
    });

    return brand;
  }

  async update(brandId: string, userId: string, data: UpdateBrandInput) {
    // Verify ownership
    await this.getById(brandId, userId);

    const brand = await prisma.brand.update({
      where: { id: brandId },
      data,
      include: {
        _count: {
          select: { queries: true },
        },
      },
    });

    return brand;
  }

  async delete(brandId: string, userId: string) {
    // Verify ownership
    await this.getById(brandId, userId);

    await prisma.brand.delete({
      where: { id: brandId },
    });

    return { success: true };
  }
}

export const brandService = new BrandService();
