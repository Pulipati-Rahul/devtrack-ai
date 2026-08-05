import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// Search History Table (stores recent search queries for each user)
export const searchHistory = pgTable('search_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  query: varchar('query', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('search_history_user_id_idx').on(table.userId),
    createdAtIdx: index('search_history_created_at_idx').on(table.createdAt),
  };
});

// Pinned Command Table (stores pinned commands/favorites for each user)
export const pinnedCommand = pgTable('pinned_command', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  commandId: varchar('command_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('pinned_command_user_id_idx').on(table.userId),
  };
});
