import { z } from 'zod';

export const createProblemSchema = z.object({
  title: z.string().min(1, 'Problem title is required').max(255),
  platform: z.string().min(1, 'Platform is required').max(100),
  url: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topic: z.string().max(100).optional().nullable(),
  status: z.string().max(50).default('Solved'),
  timeTaken: z.number().int().min(0).optional().nullable(),
  solvedDate: z.coerce.date(),
  favorite: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  nextRevisionDate: z.coerce.date().optional().nullable(),
});

export const updateProblemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  platform: z.string().min(1).max(100).optional(),
  url: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  topic: z.string().max(100).optional().nullable(),
  status: z.string().max(50).optional(),
  timeTaken: z.number().int().min(0).optional().nullable(),
  solvedDate: z.coerce.date().optional(),
  favorite: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  nextRevisionDate: z.coerce.date().optional().nullable(),
});
