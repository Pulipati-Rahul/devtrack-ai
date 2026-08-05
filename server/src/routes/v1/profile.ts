import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../auth/middleware';
import { profileController } from '../../controllers/profile.controller';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/async-handler';
import {
  updateProfileSchema,
  educationSchema,
  experienceSchema,
  skillSchema,
  certificationSchema,
  achievementSchema,
} from '../../validations/profile.validation';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB
  },
});

const router = Router();

// GET /api/v1/profile
router.get('/', requireAuth, asyncHandler(profileController.getProfile));

// PUT /api/v1/profile
router.put('/', requireAuth, validate({ body: updateProfileSchema }), asyncHandler(profileController.updateProfile));

// POST /api/v1/profile/avatar
router.post('/avatar', requireAuth, upload.single('avatar'), asyncHandler(profileController.uploadAvatar));

// DELETE /api/v1/profile/avatar
router.delete('/avatar', requireAuth, asyncHandler(profileController.deleteAvatar));

// --- Education Routing ---
router.post('/education', requireAuth, validate({ body: educationSchema }), asyncHandler(profileController.addEducation));
router.put('/education/:id', requireAuth, validate({ body: educationSchema }), asyncHandler(profileController.updateEducation));
router.delete('/education/:id', requireAuth, asyncHandler(profileController.deleteEducation));

// --- Experience Routing ---
router.post('/experience', requireAuth, validate({ body: experienceSchema }), asyncHandler(profileController.addExperience));
router.put('/experience/:id', requireAuth, validate({ body: experienceSchema }), asyncHandler(profileController.updateExperience));
router.delete('/experience/:id', requireAuth, asyncHandler(profileController.deleteExperience));

// --- Skills Routing ---
router.post('/skill', requireAuth, validate({ body: skillSchema }), asyncHandler(profileController.addSkill));
router.delete('/skill/:id', requireAuth, asyncHandler(profileController.deleteSkill));

// --- Certification Routing ---
router.post('/certification', requireAuth, validate({ body: certificationSchema }), asyncHandler(profileController.addCertification));
router.put('/certification/:id', requireAuth, validate({ body: certificationSchema }), asyncHandler(profileController.updateCertification));
router.delete('/certification/:id', requireAuth, asyncHandler(profileController.deleteCertification));

// --- Achievement Routing ---
router.post('/achievement', requireAuth, validate({ body: achievementSchema }), asyncHandler(profileController.addAchievement));
router.put('/achievement/:id', requireAuth, validate({ body: achievementSchema }), asyncHandler(profileController.updateAchievement));
router.delete('/achievement/:id', requireAuth, asyncHandler(profileController.deleteAchievement));

export default router;
