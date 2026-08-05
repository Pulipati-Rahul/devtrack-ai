import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { emailController } from '../../email/controllers/email.controller';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/send', requireAuth, asyncHandler(emailController.send));
router.post('/test', requireAuth, asyncHandler(emailController.test));
router.get('/status', requireAuth, asyncHandler(emailController.status));

export default router;
