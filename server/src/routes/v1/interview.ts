import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { interviewController } from '../../controllers/interview.controller';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/async-handler';
import { createSessionSchema, updateSessionSchema, toggleQuestionStateSchema } from '../../validations/interview.validation';

const router = Router();

router.get('/questions', requireAuth, asyncHandler(interviewController.listQuestions));
router.post('/questions/state', requireAuth, validate({ body: toggleQuestionStateSchema }), asyncHandler(interviewController.toggleQuestionState));

router.get('/history', requireAuth, asyncHandler(interviewController.listSessions));
router.post('/session', requireAuth, validate({ body: createSessionSchema }), asyncHandler(interviewController.createSession));
router.put('/session/:id', requireAuth, validate({ body: updateSessionSchema }), asyncHandler(interviewController.updateSession));
router.delete('/session/:id', requireAuth, asyncHandler(interviewController.deleteSession));

router.get('/statistics', requireAuth, asyncHandler(interviewController.getStatistics));

export default router;
