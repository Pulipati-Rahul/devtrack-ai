import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// User Setting Table
export const userSetting = pgTable('user_setting', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  theme: varchar('theme', { length: 50 }).default('system').notNull(),
  language: varchar('language', { length: 50 }).default('en').notNull(),
  notifications: jsonb('notifications'),
  privacy: jsonb('privacy'),
  aiPreferences: jsonb('ai_preferences'),
  resumePreferences: jsonb('resume_preferences'),
  portfolioPreferences: jsonb('portfolio_preferences'),
  integrations: jsonb('integrations'),
  appearance: jsonb('appearance'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('user_setting_user_id_idx').on(table.userId),
  };
});
