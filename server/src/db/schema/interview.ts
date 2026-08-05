import { pgTable, uuid, varchar, text, timestamp, integer, index, boolean } from 'drizzle-orm/pg-core';
import { user } from './user';

// Interview Session Table
export const interviewSession = pgTable('interview_session', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  company: varchar('company', { length: 255 }),
  position: varchar('position', { length: 255 }),
  duration: integer('duration'),
  notes: text('notes'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  score: integer('score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('interview_session_user_id_idx').on(table.userId),
    categoryIdx: index('interview_session_category_idx').on(table.category),
  };
});

// Interview Feedback Table
export const interviewFeedback = pgTable('interview_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => interviewSession.id, { onDelete: 'cascade' }).notNull(),
  feedback: text('feedback').notNull(),
  rating: integer('rating').notNull(),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    sessionIdIdx: index('interview_feedback_session_id_idx').on(table.sessionId),
  };
});

// Interview Question State Table (persists bookmarks and solved flags)
export const interviewQuestionState = pgTable('interview_question_state', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  questionId: varchar('question_id', { length: 100 }).notNull(),
  bookmarked: boolean('bookmarked').default(false).notNull(),
  solved: boolean('solved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('interview_question_state_user_id_idx').on(table.userId),
    questionIdIdx: index('interview_question_state_question_id_idx').on(table.questionId),
  };
});
