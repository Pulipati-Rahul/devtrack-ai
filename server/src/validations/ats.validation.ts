import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  resumeId: z.string().uuid().optional().nullable(),
  resumeName: z.string().min(1, 'Resume name/label is required').max(255),
  rawResumeText: z.string().min(1, 'Resume details/text is required'),
  jobTitle: z.string().min(1, 'Target job title is required').max(255),
  company: z.string().min(1, 'Target company name is required').max(255),
  jobDescription: z.string().min(1, 'Job description text is required'),
});
