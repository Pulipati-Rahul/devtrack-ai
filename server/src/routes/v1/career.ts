import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { careerController } from '../../controllers/career.controller';
import { aiRateLimiter } from '../../ai/middleware/rate-limiter';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

// Conversations & Chat
router.post('/chat', requireAuth, aiRateLimiter, asyncHandler(careerController.chat));
router.get('/history', requireAuth, asyncHandler(careerController.listHistory));
router.delete('/history/:id', requireAuth, asyncHandler(careerController.deleteHistory));

// SWOT Profile Analysis
router.post('/analyze', requireAuth, aiRateLimiter, asyncHandler(careerController.analyze));

// Goals Management APIs
router.get('/goals', requireAuth, asyncHandler(careerController.listGoals));
router.post('/goals', requireAuth, asyncHandler(careerController.createGoal));
router.put('/goals/:id', requireAuth, asyncHandler(careerController.updateGoal));
router.delete('/goals/:id', requireAuth, asyncHandler(careerController.deleteGoal));

// Roadmap APIs
router.get('/roadmap', requireAuth, asyncHandler(careerController.getRoadmap));
router.post('/roadmap/generate', requireAuth, aiRateLimiter, asyncHandler(careerController.generateRoadmap));

// Recommendations APIs
router.get('/recommendations', requireAuth, asyncHandler(careerController.listRecommendations));
router.post('/recommendations/generate', requireAuth, aiRateLimiter, asyncHandler(careerController.generateRecommendations));
router.put('/recommendations/:id/toggle', requireAuth, asyncHandler(careerController.toggleRecommendation));

export default router;
