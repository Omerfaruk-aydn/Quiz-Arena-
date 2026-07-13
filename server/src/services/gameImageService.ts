import { prisma } from '../../config/prisma.js';
import type { ImageCategory } from '../../generated/prisma/client.js';

type ImageType = ImageCategory;

/**
 * Görsel Veritabanı Servisi
 * AI tarafından oluşturulan sorular için güvenilir, önceden onaylanmış
 * görselleri yönetir. imageLibrary.ts'deki hardcoded URL'leri
 * veritabanına taşıyarak yönetilebilir hale getirir.
 */
export const imageDbService = {
  async findByKeyword(category: ImageType, keyword: string) {
    const normalized = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return prisma.gameImage.findFirst({
      where: { category, keyword: { contains: normalized, mode: 'insensitive' }, isActive: true },
    });
  },

  async getRandomByCategory(category: ImageType, count = 1) {
    const images = await prisma.gameImage.findMany({
      where: { category, isActive: true },
      orderBy: { usageCount: 'asc' },
      take: count * 3,
    });
    return images.sort(() => Math.random() - 0.5).slice(0, count);
  },

  async search(category: ImageType, query: string, limit = 10) {
    const normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return prisma.gameImage.findMany({
      where: {
        category, isActive: true,
        OR: [
          { keyword: { contains: normalized, mode: 'insensitive' } },
          { tags: { has: normalized } },
        ],
      },
      take: limit,
      orderBy: { usageCount: 'desc' },
    });
  },

  async findBestMatch(category: ImageType, keywords: string[]) {
    for (const kw of keywords) {
      const result = await this.findByKeyword(category, kw);
      if (result) return result;
    }
    return null;
  },


  async create(data: { category: ImageType; keyword: string; url: string; thumbnail?: string; source?: string; tags?: string[]; addedBy?: string }) {
    return prisma.gameImage.create({
      data: { category: data.category, keyword: data.keyword.toLowerCase().trim(), url: data.url, thumbnail: data.thumbnail ?? '', source: data.source ?? '', tags: data.tags ?? [], addedBy: data.addedBy },
    });
  },

  async bulkCreate(items: Array<{ category: ImageType; keyword: string; url: string; thumbnail?: string; source?: string; tags?: string[] }>) {
    const results: Array<{ category: string; keyword: string; success: boolean }> = [];
    for (const item of items) {
      try {
        await prisma.gameImage.upsert({
          where: { category_keyword: { category: item.category, keyword: item.keyword.toLowerCase().trim() } },
          update: { url: item.url, thumbnail: item.thumbnail ?? '', source: item.source ?? '' },
          create: { category: item.category, keyword: item.keyword.toLowerCase().trim(), url: item.url, thumbnail: item.thumbnail ?? '', source: item.source ?? '', tags: item.tags ?? [] },
        });
        results.push({ category: item.category, keyword: item.keyword, success: true });
      } catch { results.push({ category: item.category, keyword: item.keyword, success: false }); }
    }
    return results;
  },

  async getStats() {
    const categories = await prisma.gameImage.groupBy({ by: ['category'], _count: { id: true }, where: { isActive: true } });
    const total = await prisma.gameImage.count({ where: { isActive: true } });
    const totalUsed = await prisma.gameImage.aggregate({ _sum: { usageCount: true } });
    return {
      total,
      totalUsageCount: totalUsed._sum.usageCount ?? 0,
      categories: categories.reduce((acc, c) => { acc[c.category] = c._count.id; return acc; }, {} as Record<string, number>),
    };
  },

  async deactivate(id: string) { return prisma.gameImage.update({ where: { id }, data: { isActive: false } }); },

  async update(id: string, data: Partial<{ keyword: string; url: string; thumbnail: string; source: string; tags: string[]; isActive: boolean }>) {
    return prisma.gameImage.update({ where: { id }, data });
  },

  async list(params: { category?: ImageType; page?: number; limit?: number; search?: string }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { isActive: true };
    if (params.category) where.category = params.category;
    if (params.search) {
      where.OR = [
        { keyword: { contains: params.search, mode: 'insensitive' as const } },
        { tags: { has: params.search } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.gameImage.findMany({ where, skip, take: limit, orderBy: { usageCount: 'desc' } }),
      prisma.gameImage.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async incrementUsage(id: string) {
    await prisma.gameImage.update({
      where: { id },
      data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
    });
  },
};