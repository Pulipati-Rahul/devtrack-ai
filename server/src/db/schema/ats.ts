import { pgTable, uuid, varchar, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './user';
import { resume } from './resume';

export const atsAnalysis = pgTable('ats_analysis', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  resumeId: uuid('resume_id').references(() => resume.id, { onDelete: 'set null' }),
  resumeName: varchar('resume_name', { length: 255 }).notNull(),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  jobDescription: text('job_description').notNull(),
  atsScore: integer('ats_score').notNull(),
  feedback: jsonb('feedback').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('ats_analysis_user_id_idx').on(table.userId),
    createdAtIdx: index('ats_analysis_created_at_idx').on(table.createdAt),
  };
});
