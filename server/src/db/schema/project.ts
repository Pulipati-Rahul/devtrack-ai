import { pgTable, uuid, varchar, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { user } from './user';

// Project Table
export const project = pgTable('project', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('Planning').notNull(), // Planning, In Progress, Testing, Completed, Archived
  priority: varchar('priority', { length: 50 }).default('Medium').notNull(), // Low, Medium, High
  githubUrl: text('github_url'),
  liveUrl: text('live_url'),
  technologies: text('technologies'),
  startDate: timestamp('start_date'),
  targetDate: timestamp('target_date'),
  completedDate: timestamp('completed_date'),
  progress: integer('progress').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => {
  return {
    userIdIdx: index('project_user_id_idx').on(table.userId),
    statusIdx: index('project_status_idx').on(table.status),
    createdAtIdx: index('project_created_at_idx').on(table.createdAt),
  };
});

// Project Task Table
export const projectTask = pgTable('project_task', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => project.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 50 }).notNull(),
  dueDate: timestamp('due_date'),
  assignedTo: varchar('assigned_to', { length: 255 }),
  tags: text('tags'),
  notes: text('notes'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    projectIdIdx: index('project_task_project_id_idx').on(table.projectId),
    statusIdx: index('project_task_status_idx').on(table.status),
  };
});

// Project Note Table
export const projectNote = pgTable('project_note', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => project.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    projectIdIdx: index('project_note_project_id_idx').on(table.projectId),
  };
});

// Project Attachment Table
export const projectAttachment = pgTable('project_attachment', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => project.id, { onDelete: 'cascade' }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    projectIdIdx: index('project_attachment_project_id_idx').on(table.projectId),
  };
});

// Project Resource Table
export const projectResource = pgTable('project_resource', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => project.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  url: text('url').notNull(),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    projectIdIdx: index('project_resource_project_id_idx').on(table.projectId),
  };
});
