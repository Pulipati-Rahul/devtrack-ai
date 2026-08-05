import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { aiController } from '../../controllers/ai.controller';
import { aiRateLimiter } from '../../ai/middleware/rate-limiter';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/chat', requireAuth, aiRateLimiter, asyncHandler(aiController.chat));
router.get('/history', requireAuth, asyncHandler(aiController.listHistory));
router.delete('/history/:id', requireAuth, asyncHandler(aiController.deleteHistory));

export default router;
