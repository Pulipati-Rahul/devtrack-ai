import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './user';

export const adminSystemConfig = pgTable('admin_system_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 255 }).unique().notNull(),
  value: text('value').notNull(),
  updatedBy: uuid('updated_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    keyIdx: index('admin_system_config_key_idx').on(table.key),
  };
});
