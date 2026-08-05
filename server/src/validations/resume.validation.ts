import { z } from 'zod';

export const createResumeSchema = z.object({
  name: z.string().min(1, 'Resume name is required').max(100, 'Resume name must be under 100 characters'),
  template: z.string().min(1, 'Template selection is required').max(100),
});

export const updateResumeSchema = z.object({
  name: z.string().min(1, 'Resume name is required').max(100).optional(),
  template: z.string().min(1).max(100).optional(),
  font: z.string().min(1).max(100).optional(),
  accentColor: z.string().min(1).max(100).optional(),
  spacing: z.number().int().min(1).max(3).optional(),
  fontSize: z.number().int().min(8).max(24).optional(),
  isDefault: z.boolean().optional(),
});

export const updateSectionSchema = z.object({
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  content: z.any().optional(),
});

export const importProfileSchema = z.object({
  sections: z.array(z.string()).min(1, 'At least one section must be selected for import'),
});
