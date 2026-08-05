import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../auth/middleware';
import { uploadController } from '../../storage/upload.controller';
import { asyncHandler } from '../../utils/async-handler';

// Configure Multer to buffer file streams in RAM
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // max 10MB
  },
});

const router = Router();

router.post('/', requireAuth, upload.single('file'), asyncHandler(uploadController.uploadSingle));
router.post('/multiple', requireAuth, upload.array('files', 10), asyncHandler(uploadController.uploadMultiple));
router.delete('/:id', requireAuth, asyncHandler(uploadController.deleteFile));
router.delete('/', requireAuth, asyncHandler(uploadController.deleteFile));

export default router;
