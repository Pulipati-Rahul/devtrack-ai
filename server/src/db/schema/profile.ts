import { pgTable, uuid, varchar, text, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// Profile Table
export const profile = pgTable('profile', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  fullName: varchar('full_name', { length: 100 }),
  username: varchar('username', { length: 50 }),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),
  avatar: text('avatar'),
  headline: varchar('headline', { length: 255 }),
  dob: timestamp('dob'),
  gender: varchar('gender', { length: 50 }),
  country: varchar('country', { length: 255 }),
  state: varchar('state', { length: 255 }),
  city: varchar('city', { length: 255 }),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  portfolioUrl: text('portfolio_url'),
  twitterUrl: text('twitter_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('profile_user_id_idx').on(table.userId),
    usernameIdx: index('profile_username_idx').on(table.username),
    createdAtIdx: index('profile_created_at_idx').on(table.createdAt),
  };
});

// Education Table
export const education = pgTable('education', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profile.id, { onDelete: 'cascade' }).notNull(),
  college: varchar('college', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 255 }).notNull(),
  branch: varchar('branch', { length: 255 }),
  cgpa: varchar('cgpa', { length: 20 }),
  startYear: integer('start_year').notNull(),
  endYear: integer('end_year'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    profileIdIdx: index('education_profile_id_idx').on(table.profileId),
  };
});

// Experience Table
export const experience = pgTable('experience', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profile.id, { onDelete: 'cascade' }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }).notNull(),
  employmentType: varchar('employment_type', { length: 100 }),
  currentlyWorking: boolean('currently_working').default(false).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    profileIdIdx: index('experience_profile_id_idx').on(table.profileId),
  };
});

// Skill Table
export const skill = pgTable('skill', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profile.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // Language, Frontend, Backend, Database, Cloud, DevOps, AI, Soft Skill
  level: varchar('level', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    profileIdIdx: index('skill_profile_id_idx').on(table.profileId),
  };
});

// Certification Table
export const certification = pgTable('certification', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profile.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  issuer: varchar('issuer', { length: 255 }).notNull(),
  issueDate: timestamp('issue_date'),
  credentialId: varchar('credential_id', { length: 255 }),
  credentialUrl: text('credential_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    profileIdIdx: index('certification_profile_id_idx').on(table.profileId),
  };
});

// Achievement Table
export const achievement = pgTable('achievement', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profile.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: timestamp('date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    profileIdIdx: index('achievement_profile_id_idx').on(table.profileId),
  };
});
