import { z } from 'zod';

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Interview session title is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  company: z.string().max(255).optional().nullable(),
  position: z.string().max(255).optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  score: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  strengths: z.string().optional().nullable(),
  weaknesses: z.string().optional().nullable(),
});

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  category: z.string().min(1).max(100).optional(),
  company: z.string().max(255).optional().nullable(),
  position: z.string().max(255).optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  score: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  strengths: z.string().optional().nullable(),
  weaknesses: z.string().optional().nullable(),
});

export const toggleQuestionStateSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  bookmarked: z.boolean().optional(),
  solved: z.boolean().optional(),
});
