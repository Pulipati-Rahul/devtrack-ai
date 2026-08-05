import { pgTable, uuid, varchar, text, boolean, timestamp, integer, index, jsonb } from 'drizzle-orm/pg-core';
import { user } from './user';
import { project } from './project';

// Portfolio Table
export const portfolio = pgTable('portfolio', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  headline: varchar('headline', { length: 255 }),
  bio: text('bio'),
  theme: varchar('theme', { length: 100 }),
  published: boolean('published').default(false).notNull(),
  publicSlug: varchar('public_slug', { length: 255 }).unique().notNull(),
  appearance: jsonb('appearance'),
  sectionsConfig: jsonb('sections_config'),
  seoSettings: jsonb('seo_settings'),
  socialLinks: jsonb('social_links'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => {
  return {
    userIdIdx: index('portfolio_user_id_idx').on(table.userId),
    publicSlugIdx: index('portfolio_public_slug_idx').on(table.publicSlug),
  };
});

// Portfolio Project Table (Many-to-Many join table)
export const portfolioProject = pgTable('portfolio_project', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioId: uuid('portfolio_id').references(() => portfolio.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('project_id').references(() => project.id, { onDelete: 'cascade' }).notNull(),
  featured: boolean('featured').default(false).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    portfolioIdIdx: index('portfolio_project_portfolio_id_idx').on(table.portfolioId),
    projectIdIdx: index('portfolio_project_project_id_idx').on(table.projectId),
  };
});
