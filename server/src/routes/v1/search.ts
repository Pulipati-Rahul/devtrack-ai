import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { searchController } from '../../controllers/search.controller';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.get('/', requireAuth, asyncHandler(searchController.search));
router.get('/recent', requireAuth, asyncHandler(searchController.getRecent));
router.post('/', requireAuth, asyncHandler(searchController.saveSearch));
router.get('/commands', requireAuth, asyncHandler(searchController.listCommands));
router.post('/commands/pin', requireAuth, asyncHandler(searchController.togglePin));

export default router;
