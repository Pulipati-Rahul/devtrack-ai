import { BaseService } from '../services/base.service';
import { cloudinaryClient } from './cloudinary.client';
import { ValidationError } from '../errors/app-errors';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

export class UploadService extends BaseService {
  constructor() {
    super('UploadService');
  }

  /**
   * Validates file size, extension, and mime-type.
   */
  private validateFile(file: { originalname: string; mimetype: string; size: number }) {
    // 1. Mime-type whitelist check
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ValidationError({}, `Unsupported file type: ${file.mimetype}. Allowed types: Images, PDF, DOCX, ZIP.`);
    }

    // 2. Size limit checks
    const isImage = file.mimetype.startsWith('image/');
    const limit = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
    if (file.size > limit) {
      throw new ValidationError({}, `File is too large (${Math.round(file.size / 1024 / 1024)}MB). Max limit is ${isImage ? '5MB' : '10MB'}.`);
    }

    // 3. Check malicious filenames
    const hasMaliciousChars = /[<>:"/\\|?*]/.test(file.originalname);
    if (hasMaliciousChars) {
      throw new ValidationError({}, 'Invalid file name characters detected.');
    }
  }

  /**
   * Uploads a single file to Cloudinary.
   */
  public async uploadSingle(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    folder: string,
    publicId?: string
  ) {
    this.validateFile(file);
    this.logInfo('Uploading single file stream to Cloudinary', { originalname: file.originalname, folder });

    const cleanFilename = file.originalname.replace(/\s+/g, '_');
    const customId = publicId || `${Date.now()}_${cleanFilename.split('.')[0]}`;

    const result = await cloudinaryClient.uploadBuffer(file.buffer, folder, customId);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: file.size,
      mimeType: file.mimetype,
      folder: result.folder,
      createdAt: result.created_at,
    };
  }

  /**
   * Uploads multiple files.
   */
  public async uploadMultiple(
    files: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
    folder: string
  ) {
    this.logInfo(`Batch uploading ${files.length} files to Cloudinary`, { folder });
    
    const uploadPromises = files.map((file) => this.uploadSingle(file, folder));
    return await Promise.all(uploadPromises);
  }

  /**
   * Deletes a file resource.
   */
  public async deleteFile(publicId: string) {
    this.logInfo('Deleting file from Cloudinary', { publicId });
    return await cloudinaryClient.deleteResource(publicId);
  }
}

export const uploadService = new UploadService();
