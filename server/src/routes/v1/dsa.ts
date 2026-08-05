import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { dsaController } from '../../controllers/dsa.controller';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/async-handler';
import { createProblemSchema, updateProblemSchema } from '../../validations/dsa.validation';

const router = Router();

router.get('/problems', requireAuth, asyncHandler(dsaController.listProblems));
router.post('/problems', requireAuth, validate({ body: createProblemSchema }), asyncHandler(dsaController.createProblem));
router.put('/problems/:id', requireAuth, validate({ body: updateProblemSchema }), asyncHandler(dsaController.updateProblem));
router.delete('/problems/:id', requireAuth, asyncHandler(dsaController.deleteProblem));

router.get('/statistics', requireAuth, asyncHandler(dsaController.getStatistics));
router.get('/revisions', requireAuth, asyncHandler(dsaController.getRevisions));
router.post('/revisions/:id/complete', requireAuth, asyncHandler(dsaController.completeRevision));

export default router;
