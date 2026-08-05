import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { resumeController } from '../../controllers/resume.controller';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/async-handler';
import {
  createResumeSchema,
  updateResumeSchema,
  updateSectionSchema,
  importProfileSchema,
} from '../../validations/resume.validation';

const router = Router();

// GET /api/v1/resumes
router.get('/', requireAuth, asyncHandler(resumeController.listResumes));

// POST /api/v1/resumes
router.post('/', requireAuth, validate({ body: createResumeSchema }), asyncHandler(resumeController.createResume));

// GET /api/v1/resumes/:id
router.get('/:id', requireAuth, asyncHandler(resumeController.getResume));

// PUT /api/v1/resumes/:id
router.put('/:id', requireAuth, validate({ body: updateResumeSchema }), asyncHandler(resumeController.updateResume));

// PUT /api/v1/resumes/:id/sections/:sectionId
router.put('/:id/sections/:sectionId', requireAuth, validate({ body: updateSectionSchema }), asyncHandler(resumeController.updateResumeSection));

// DELETE /api/v1/resumes/:id
router.delete('/:id', requireAuth, asyncHandler(resumeController.deleteResume));

// POST /api/v1/resumes/:id/duplicate
router.post('/:id/duplicate', requireAuth, asyncHandler(resumeController.duplicateResume));

// POST /api/v1/resumes/:id/import-profile
router.post('/:id/import-profile', requireAuth, validate({ body: importProfileSchema }), asyncHandler(resumeController.importProfile));

// POST /api/v1/resumes/:id/export
router.post('/:id/export', requireAuth, asyncHandler(resumeController.exportResume));

export default router;
