import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { settingsController } from '../../controllers/settings.controller';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.get('/settings', requireAuth, asyncHandler(settingsController.getSettings));
router.put('/settings', requireAuth, asyncHandler(settingsController.updateSettings));
router.get('/sessions', requireAuth, asyncHandler(settingsController.getSessions));
router.delete('/sessions/:id', requireAuth, asyncHandler(settingsController.deleteSession));
router.post('/export', requireAuth, asyncHandler(settingsController.exportUserData));
router.post('/delete-data', requireAuth, asyncHandler(settingsController.deleteUserData));

export default router;
