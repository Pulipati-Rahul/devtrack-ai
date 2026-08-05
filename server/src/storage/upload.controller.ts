import { Request, Response } from 'express';
import { BaseController } from '../controllers/base.controller';
import { uploadService } from './upload.service';
import { ValidationError } from '../errors/app-errors';

export class UploadController extends BaseController {
  public uploadSingle = async (req: Request, res: Response) => {
    const file = req.file;
    const folder = (req.body.folder as string) || 'temporary';

    if (!file) {
      throw new ValidationError({}, 'No file was uploaded in request payload.');
    }

    const metadata = await uploadService.uploadSingle(file, folder);
    return this.ok(res, metadata, 'File uploaded successfully');
  };

  public uploadMultiple = async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const folder = (req.body.folder as string) || 'temporary';

    if (!files || files.length === 0) {
      throw new ValidationError({}, 'No files were uploaded in request payload.');
    }

    const metadataList = await uploadService.uploadMultiple(files, folder);
    return this.ok(res, metadataList, 'Batch files uploaded successfully');
  };

  public deleteFile = async (req: Request, res: Response) => {
    const publicId = req.params.id || (req.query.publicId as string) || req.body.publicId;

    if (!publicId) {
      throw new ValidationError({}, 'Public ID parameter is required.');
    }

    await uploadService.deleteFile(publicId);
    return this.ok(res, null, 'File removed from Cloudinary successfully');
  };
}
export const uploadController = new UploadController();
