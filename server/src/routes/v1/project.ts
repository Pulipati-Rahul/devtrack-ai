import { Router } from 'express';
import { requireAuth } from '../../auth/middleware';
import { projectController } from '../../controllers/project.controller';
import { validate } from '../../middleware/validation';
import { asyncHandler } from '../../utils/async-handler';
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  createNoteSchema,
  updateNoteSchema,
  createResourceSchema,
  createAttachmentSchema,
} from '../../validations/project.validation';

const router = Router();

// --- 1. Project Routes ---
router.get('/', requireAuth, asyncHandler(projectController.listProjects));
router.get('/stats', requireAuth, asyncHandler(projectController.getStats));
router.get('/:id', requireAuth, asyncHandler(projectController.getProject));
router.post('/', requireAuth, validate({ body: createProjectSchema }), asyncHandler(projectController.createProject));
router.put('/:id', requireAuth, validate({ body: updateProjectSchema }), asyncHandler(projectController.updateProject));
router.delete('/:id', requireAuth, asyncHandler(projectController.deleteProject));
router.post('/:id/archive', requireAuth, asyncHandler(projectController.archiveProject));
router.post('/:id/duplicate', requireAuth, asyncHandler(projectController.duplicateProject));

// --- 2. Task Routes ---
router.post('/:id/tasks', requireAuth, validate({ body: createTaskSchema }), asyncHandler(projectController.createTask));
router.put('/:id/tasks/:taskId', requireAuth, validate({ body: updateTaskSchema }), asyncHandler(projectController.updateTask));
router.delete('/:id/tasks/:taskId', requireAuth, asyncHandler(projectController.deleteTask));

// --- 3. Note Routes ---
router.post('/:id/notes', requireAuth, validate({ body: createNoteSchema }), asyncHandler(projectController.createNote));
router.put('/:id/notes/:noteId', requireAuth, validate({ body: updateNoteSchema }), asyncHandler(projectController.updateNote));
router.delete('/:id/notes/:noteId', requireAuth, asyncHandler(projectController.deleteNote));

// --- 4. Resource Routes ---
router.post('/:id/resources', requireAuth, validate({ body: createResourceSchema }), asyncHandler(projectController.createResource));
router.delete('/:id/resources/:resourceId', requireAuth, asyncHandler(projectController.deleteResource));

// --- 5. Attachment Routes ---
router.post('/:id/attachments', requireAuth, validate({ body: createAttachmentSchema }), asyncHandler(projectController.createAttachment));
router.delete('/:id/attachments/:attachmentId', requireAuth, asyncHandler(projectController.deleteAttachment));

export default router;
