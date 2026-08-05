import { pgTable, uuid, varchar, text, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// DSA Problem Table
export const dsaProblem = pgTable('dsa_problem', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 100 }).notNull(),
  url: text('url'),
  difficulty: varchar('difficulty', { length: 50 }).notNull(), // Easy, Medium, Hard
  topic: varchar('topic', { length: 100 }),
  status: varchar('status', { length: 50 }).default('Solved').notNull(), // Solved, Reviewing, Todo
  timeTaken: integer('time_taken'), // in minutes
  solvedDate: timestamp('solved_date').notNull(),
  favorite: boolean('favorite').default(false).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('dsa_problem_user_id_idx').on(table.userId),
    difficultyIdx: index('dsa_problem_difficulty_idx').on(table.difficulty),
    topicIdx: index('dsa_problem_topic_idx').on(table.topic),
  };
});

// DSA Revision Table
export const dsaRevision = pgTable('dsa_revision', {
  id: uuid('id').defaultRandom().primaryKey(),
  problemId: uuid('problem_id').references(() => dsaProblem.id, { onDelete: 'cascade' }).notNull(),
  nextRevision: timestamp('next_revision').notNull(),
  revisionCount: integer('revision_count').default(0).notNull(),
  lastRevision: timestamp('last_revision'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    problemIdIdx: index('dsa_revision_problem_id_idx').on(table.problemId),
    nextRevisionIdx: index('dsa_revision_next_revision_idx').on(table.nextRevision),
  };
});
