import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(255),
  description: z.string().optional().nullable(),
  status: z.string().min(1).max(50).default('Planning'),
  priority: z.string().min(1).max(50).default('Medium'),
  githubUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  liveUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  technologies: z.string().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.string().min(1).max(50).optional(),
  priority: z.string().min(1).max(50).optional(),
  githubUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  liveUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  technologies: z.string().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
  completedDate: z.coerce.date().optional().nullable(),
  progress: z.number().int().min(0).max(100).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().optional().nullable(),
  status: z.string().min(1).max(50),
  priority: z.string().min(1).max(50),
  dueDate: z.coerce.date().optional().nullable(),
  assignedTo: z.string().max(255).optional().nullable(),
  tags: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.string().min(1).max(50).optional(),
  priority: z.string().min(1).max(50).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  assignedTo: z.string().max(255).optional().nullable(),
  tags: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
});

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Note title is required').max(255),
  content: z.string().optional().nullable(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional().nullable(),
});

export const createResourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required').max(255),
  url: z.string().url('Must be a valid URL'),
  category: z.string().max(100).optional().nullable(),
});

export const createAttachmentSchema = z.object({
  fileName: z.string().min(1, 'Filename is required').max(255),
  fileUrl: z.string().url('Must be a valid URL'),
  fileSize: z.number().int().positive(),
  mimeType: z.string().max(100),
});
