import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { imageDbService } from '../../services/gameImageService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticate);

// Görsel arama
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const { category, q, page, limit } = req.query;
    if (!category || typeof category !== 'string') {
      throw ApiError.badRequest('Kategori gerekli', 'NO_CATEGORY');
    }
    const result = await imageDbService.list({
      category: category as never,
      search: typeof q === 'string' ? q : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  }),
);

// Kategori istatistikleri
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const stats = await imageDbService.getStats();
    res.json(stats);
  }),
);

// Rastgele görsel
router.get(
  '/random/:category',
  asyncHandler(async (req, res) => {
    const { category } = req.params;
    const count = Math.min(Number(req.query.count) || 1, 20);
    const images = await imageDbService.getRandomByCategory(category as never, count);
    res.json(images);
  }),
);

// Anahtar kelime ile görsel bul
router.get(
  '/:category/:keyword',
  asyncHandler(async (req, res) => {
    const { category, keyword } = req.params;
    const image = await imageDbService.findByKeyword(category as never, keyword);
    if (!image) {
      throw ApiError.notFound('Görsel bulunamadı', 'IMAGE_NOT_FOUND');
    }
    await imageDbService.incrementUsage(image.id);
    res.json(image);
  }),
);

// Görsel ekle (admin)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { category, keyword, url, thumbnail, source, tags } = req.body;
    if (!category || !keyword || !url) {
      throw ApiError.badRequest('Kategori, anahtar kelime ve URL gerekli', 'MISSING_FIELDS');
    }
    const image = await imageDbService.create({
      category,
      keyword,
      url,
      thumbnail,
      source,
      tags,
      addedBy: req.user?._id,
    });
    res.status(201).json(image);
  }),
);

// Toplu ekle (seed)
router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('Geçersiz veri', 'INVALID_DATA');
    }
    const results = await imageDbService.bulkCreate(items);
    res.json({ total: results.length, success: results.filter((r) => r.success).length, results });
  }),
);

// Görsel güncelle
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const image = await imageDbService.update(id, req.body);
    res.json(image);
  }),
);

// Görsel sil (soft delete)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await imageDbService.deactivate(id);
    res.json({ ok: true });
  }),
);

export default router;
