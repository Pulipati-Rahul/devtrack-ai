import { z } from 'zod';

export const createPortfolioSchema = z.object({
  publicSlug: z
    .string()
    .min(1, 'Public slug is required')
    .max(255)
    .regex(/^[a-z0-9-_]+$/, 'Public slug can only contain lowercase letters, numbers, dashes, and underscores'),
});

export const updatePortfolioSchema = z.object({
  headline: z.string().max(255).optional().nullable(),
  bio: z.string().optional().nullable(),
  theme: z.string().max(100).optional().nullable(),
  publicSlug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-_]+$/, 'Public slug can only contain lowercase letters, numbers, dashes, and underscores')
    .optional(),
  appearance: z
    .object({
      primaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      typography: z.string().optional(),
      darkMode: z.boolean().optional(),
      cardStyle: z.string().optional(),
      spacing: z.string().optional(),
      borderRadius: z.string().optional(),
    })
    .optional()
    .nullable(),
  sectionsConfig: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        visible: z.boolean(),
        sortOrder: z.number(),
      })
    )
    .optional()
    .nullable(),
  seoSettings: z
    .object({
      title: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      keywords: z.string().optional().nullable(),
      ogImage: z.string().optional().nullable(),
      canonicalUrl: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  socialLinks: z
    .object({
      github: z.string().url().or(z.literal('')).optional().nullable(),
      linkedin: z.string().url().or(z.literal('')).optional().nullable(),
      twitter: z.string().url().or(z.literal('')).optional().nullable(),
      portfolio: z.string().url().or(z.literal('')).optional().nullable(),
      email: z.string().email().or(z.literal('')).optional().nullable(),
    })
    .optional()
    .nullable(),
  published: z.boolean().optional(),
});

export const syncFeaturedProjectsSchema = z.object({
  projects: z.array(
    z.object({
      projectId: z.string().uuid(),
      featured: z.boolean().default(false),
      sortOrder: z.number().int(),
    })
  ),
});
