import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// AI Conversation Table
export const aiConversation = pgTable('ai_conversation', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  assistant: varchar('assistant', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('ai_conversation_user_id_idx').on(table.userId),
  };
});

// AI Message Table
export const aiMessage = pgTable('ai_message', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => aiConversation.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // user, assistant, system
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    conversationIdIdx: index('ai_message_conversation_id_idx').on(table.conversationId),
  };
});

// Activity Log Table
export const activityLog = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }), // can be null for system actions
  action: varchar('action', { length: 255 }).notNull(),
  module: varchar('module', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('activity_log_user_id_idx').on(table.userId),
    createdAtIdx: index('activity_log_created_at_idx').on(table.createdAt),
  };
});

// Achievement Unlock Table
export const achievementUnlock = pgTable('achievement_unlock', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  achievementName: varchar('achievement_name', { length: 255 }).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('achievement_unlock_user_id_idx').on(table.userId),
  };
});

// Analytics Snapshot Table
export const analyticsSnapshot = pgTable('analytics_snapshot', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  snapshotType: varchar('snapshot_type', { length: 50 }).notNull(), // 'weekly' | 'monthly' | 'daily'
  scores: jsonb('scores').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('analytics_snapshot_user_id_idx').on(table.userId),
  };
});

// Analytics Report Table
export const analyticsReport = pgTable('analytics_report', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  reportType: varchar('report_type', { length: 50 }).notNull(), // 'weekly' | 'monthly' | 'career' | 'resume' | 'interview'
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  insights: jsonb('insights').notNull(), // Strengths, Weaknesses, Missing Gaps, Active weeks, suggestions
  actionItems: jsonb('action_items').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('analytics_report_user_id_idx').on(table.userId),
  };
});
