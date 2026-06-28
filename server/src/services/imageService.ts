import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import sharp from 'sharp';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

let configured = false;

export function configureCloudinary(): void {
  if (configured) return;
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
    logger.warn('Cloudinary yapılandırılmamış, görsel yükleme devre dışı');
    return;
  }
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  configured = true;
}

export function assertImageFile(file: { mimetype: string; size: number }): void {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    throw ApiError.badRequest('Sadece JPEG, PNG, WebP desteklenir', 'INVALID_FILE_TYPE');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw ApiError.badRequest('Dosya boyutu 5MB sınırını aşıyor', 'FILE_TOO_LARGE');
  }
}

export async function optimizeBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .toFormat('webp')
    .toBuffer();
}

export async function uploadImage(
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  configureCloudinary();
  if (!configured) {
    throw ApiError.internal('Görsel yükleme yapılandırılmamış');
  }
  const optimized = await optimizeBuffer(buffer);
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp' },
      (err, result: UploadApiResponse | undefined) => {
        if (err || !result) return reject(err ?? ApiError.internal('Cloudinary yükleme hatası'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(optimized);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId || !configured) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn('Cloudinary silme hatası', { publicId, err });
  }
}
