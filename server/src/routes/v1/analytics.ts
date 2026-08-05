import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { analyticsController } from '../../controllers/analytics.controller';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

// GET /api/v1/analytics
router.get('/', requireAuth, asyncHandler(analyticsController.getDashboardData));

// GET /api/v1/analytics/dashboard
router.get('/dashboard', requireAuth, asyncHandler(analyticsController.getDashboardData));

// GET /api/v1/analytics/projects
router.get('/projects', requireAuth, asyncHandler(analyticsController.getProjectsData));

// GET /api/v1/analytics/resume
router.get('/resume', requireAuth, asyncHandler(analyticsController.getResumeData));

// GET /api/v1/analytics/dsa
router.get('/dsa', requireAuth, asyncHandler(analyticsController.getDsaData));

// GET /api/v1/analytics/interview
router.get('/interview', requireAuth, asyncHandler(analyticsController.getInterviewData));

// Snapshots
router.post('/snapshots', requireAuth, asyncHandler(analyticsController.saveSnapshot));
router.get('/snapshots', requireAuth, asyncHandler(analyticsController.listSnapshots));

// Reports
router.post('/reports/generate', requireAuth, asyncHandler(analyticsController.generateReport));
router.get('/reports', requireAuth, asyncHandler(analyticsController.listReports));

// Timeline
router.get('/timeline', requireAuth, asyncHandler(analyticsController.getTimelineData));

export default router;
