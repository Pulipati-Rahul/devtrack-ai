import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters').optional().nullable(),
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username must be under 50 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username must be alphanumeric, dashes or underscores').optional().nullable(),
  phone: z.string().regex(/^\+?[0-9\s-]{6,20}$/, 'Please enter a valid phone number').or(z.literal('')).optional().nullable(),
  bio: z.string().max(500, 'Bio must be under 500 characters').or(z.literal('')).optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').or(z.literal('')).optional().nullable(),
  headline: z.string().max(255).or(z.literal('')).optional().nullable(),
  dob: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
  gender: z.string().max(50).or(z.literal('')).optional().nullable(),
  country: z.string().max(255).or(z.literal('')).optional().nullable(),
  state: z.string().max(255).or(z.literal('')).optional().nullable(),
  city: z.string().max(255).or(z.literal('')).optional().nullable(),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')).optional().nullable(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional().nullable(),
  portfolioUrl: z.string().url('Invalid Portfolio URL').or(z.literal('')).optional().nullable(),
  twitterUrl: z.string().url('Invalid Twitter/X URL').or(z.literal('')).optional().nullable(),
});

export const educationSchema = z.object({
  college: z.string().min(2, 'Institution/College name is required').max(255),
  degree: z.string().min(2, 'Degree is required').max(255),
  branch: z.string().max(255).or(z.literal('')).optional().nullable(),
  cgpa: z.string().max(20).or(z.literal('')).optional().nullable(),
  startYear: z.number().int().min(1900, 'Invalid start year').max(2100),
  endYear: z.number().int().min(1900).max(2100).optional().nullable(),
  description: z.string().max(1000).or(z.literal('')).optional().nullable(),
});

export const experienceSchema = z.object({
  company: z.string().min(2, 'Company is required').max(255),
  position: z.string().min(2, 'Position/Role is required').max(255),
  employmentType: z.string().max(100).or(z.literal('')).optional().nullable(),
  currentlyWorking: z.boolean().default(false),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date format'),
  endDate: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date format'),
  description: z.string().max(2000).or(z.literal('')).optional().nullable(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(255),
  category: z.enum(['Languages', 'Frontend', 'Backend', 'Database', 'DevOps', 'Cloud', 'AI', 'Soft Skills', 'Tools']),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional().nullable(),
});

export const certificationSchema = z.object({
  title: z.string().min(2, 'Title is required').max(255),
  issuer: z.string().min(2, 'Issuer organization is required').max(255),
  issueDate: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
  credentialId: z.string().max(255).or(z.literal('')).optional().nullable(),
  credentialUrl: z.string().url('Invalid credential URL').or(z.literal('')).optional().nullable(),
});

export const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required').max(255),
  description: z.string().max(2000).or(z.literal('')).optional().nullable(),
  date: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
});
