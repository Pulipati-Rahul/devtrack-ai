import { Router } from 'express';
import { requireAdmin } from '../../auth/middleware';
import { adminController } from '../../controllers/admin.controller';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.get('/dashboard', requireAdmin, asyncHandler(adminController.getDashboard));
router.get('/users', requireAdmin, asyncHandler(adminController.getUsers));
router.get('/users/:id', requireAdmin, asyncHandler(adminController.getUserDetails));
router.put('/users/:id', requireAdmin, asyncHandler(adminController.updateUser));
router.delete('/users/:id', requireAdmin, asyncHandler(adminController.deleteUser));
router.get('/system', requireAdmin, asyncHandler(adminController.getSystemMetrics));
router.get('/logs', requireAdmin, asyncHandler(adminController.getActivityLogs));
router.get('/analytics', requireAdmin, asyncHandler(adminController.getAnalytics));

export default router;
