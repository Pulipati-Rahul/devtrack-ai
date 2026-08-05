import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// Career Analysis Reports Table
export const careerReport = pgTable('career_report', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  report: jsonb('report').notNull(), // SWOT, SWOT details, recommendations
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('career_report_user_id_idx').on(table.userId),
  };
});

// Career Goals Table
export const careerGoal = pgTable('career_goal', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  targetDate: timestamp('target_date'),
  status: varchar('status', { length: 50 }).default('Pending').notNull(), // Pending, Completed, Archived
  aiGenerated: boolean('ai_generated').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('career_goal_user_id_idx').on(table.userId),
  };
});

// Career Roadmaps Table
export const careerRoadmap = pgTable('career_roadmap', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  steps: jsonb('steps').notNull(), // plan30Days, plan90Days, plan6Months, plan1Year
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('career_roadmap_user_id_idx').on(table.userId),
  };
});

// Career Recommendations Table
export const careerRecommendation = pgTable('career_recommendation', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // Course, Project, Certification, Technology, DSA, Interview, Book, Doc
  title: varchar('title', { length: 255 }).notNull(),
  link: text('link'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('career_recommendation_user_id_idx').on(table.userId),
  };
});
