import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

export class CloudinaryClient {
  private static instance: CloudinaryClient;

  private constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  public static getInstance(): CloudinaryClient {
    if (!CloudinaryClient.instance) {
      CloudinaryClient.instance = new CloudinaryClient();
    }
    return CloudinaryClient.instance;
  }

  /**
   * Streams a file buffer directly to Cloudinary folder.
   */
  public uploadBuffer(
    buffer: Buffer,
    folder: string,
    publicId?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `devtrack-ai/${folder}`,
          public_id: publicId,
          resource_type: 'auto',
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  }

  /**
   * Deletes a file resource from Cloudinary by its public ID.
   */
  public async deleteResource(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  /**
   * Generates optimized thumbnail image transformation URLs.
   */
  public getThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: 'thumb',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  /**
   * Generates compressed image transformation URLs.
   */
  public getOptimizedUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
    });
  }
}

export const cloudinaryClient = CloudinaryClient.getInstance();
export { cloudinary };
