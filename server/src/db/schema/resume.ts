import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// Resume Table
export const resume = pgTable('resume', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  template: varchar('template', { length: 100 }),
  summary: text('summary'),
  isDefault: boolean('is_default').default(false).notNull(),
  lastExported: timestamp('last_exported'),
  font: varchar('font', { length: 100 }).default('Inter').notNull(),
  accentColor: varchar('accent_color', { length: 100 }).default('#3b82f6').notNull(),
  spacing: integer('spacing').default(2).notNull(),
  fontSize: integer('font_size').default(12).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => {
  return {
    userIdIdx: index('resume_user_id_idx').on(table.userId),
    createdAtIdx: index('resume_created_at_idx').on(table.createdAt),
  };
});

// Resume Section Table
export const resumeSection = pgTable('resume_section', {
  id: uuid('id').defaultRandom().primaryKey(),
  resumeId: uuid('resume_id').references(() => resume.id, { onDelete: 'cascade' }).notNull(),
  sectionType: varchar('section_type', { length: 100 }).notNull(),
  sortOrder: integer('sort_order').notNull(),
  visible: boolean('visible').default(true).notNull(),
  content: jsonb('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    resumeIdIdx: index('resume_section_resume_id_idx').on(table.resumeId),
  };
});
