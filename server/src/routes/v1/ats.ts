import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../auth/middleware';
import { atsController } from '../../controllers/ats.controller';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/async-handler';
import { analyzeResumeSchema } from '../../validations/ats.validation';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// POST /api/v1/ats/upload
router.post('/upload', requireAuth, upload.single('file'), asyncHandler(atsController.uploadAndParse));

// POST /api/v1/ats/analyze
router.post('/analyze', requireAuth, validate({ body: analyzeResumeSchema }), asyncHandler(atsController.analyze));

// GET /api/v1/ats/history
router.get('/history', requireAuth, asyncHandler(atsController.listHistory));

// GET /api/v1/ats/stats
router.get('/stats', requireAuth, asyncHandler(atsController.getStats));

// GET /api/v1/ats/:id
router.get('/:id', requireAuth, asyncHandler(atsController.getAnalysis));

// DELETE /api/v1/ats/:id
router.delete('/:id', requireAuth, asyncHandler(atsController.deleteAnalysis));

export default router;
