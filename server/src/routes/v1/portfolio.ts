import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { portfolioController } from '../../controllers/portfolio.controller';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/async-handler';
import { createPortfolioSchema, updatePortfolioSchema } from '../../validations/portfolio.validation';

const router = Router();

// --- Public Route ---
router.get('/:slug', asyncHandler(portfolioController.getPublicPortfolio));

// --- Protected Routes ---
router.get('/', requireAuth, asyncHandler(portfolioController.getPortfolio));
router.post('/', requireAuth, validate({ body: createPortfolioSchema }), asyncHandler(portfolioController.savePortfolio));
router.put('/', requireAuth, validate({ body: updatePortfolioSchema }), asyncHandler(portfolioController.updatePortfolio));
router.delete('/', requireAuth, asyncHandler(portfolioController.deletePortfolio));
router.post('/publish', requireAuth, asyncHandler(portfolioController.publish));
router.post('/unpublish', requireAuth, asyncHandler(portfolioController.unpublish));
router.get('/import/profile', requireAuth, asyncHandler(portfolioController.importProfile));

export default router;
