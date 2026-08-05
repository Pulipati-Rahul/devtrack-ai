import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { settingsController } from '../../controllers/settings.controller';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/delete-request', requireAuth, asyncHandler(settingsController.deleteRequest));

export default router;
