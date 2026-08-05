import { user } from '../db/schema/user';
import { profile, education, experience, skill } from '../db/schema/profile';
import { resume } from '../db/schema/resume';
import { project } from '../db/schema/project';
import { portfolio } from '../db/schema/portfolio';
import { dsaProblem, dsaRevision } from '../db/schema/dsa';
import { interviewSession, interviewFeedback } from '../db/schema/interview';

// Extract Selection / Insertion types
export type DbUser = typeof user.$inferSelect;
export type DbNewUser = typeof user.$inferInsert;

export type DbProfile = typeof profile.$inferSelect;
export type DbNewProfile = typeof profile.$inferInsert;

export type DbResume = typeof resume.$inferSelect;
export type DbNewResume = typeof resume.$inferInsert;

export type DbProject = typeof project.$inferSelect;
export type DbNewProject = typeof project.$inferInsert;

// User Repository Contract
export interface IUserRepository {
  findById(id: string): Promise<DbUser | null>;
  findByEmail(email: string): Promise<DbUser | null>;
  create(data: DbNewUser): Promise<DbUser>;
  update(id: string, data: Partial<DbNewUser>): Promise<DbUser>;
  delete(id: string): Promise<boolean>;
}

// Profile Repository Contract
export interface IProfileRepository {
  findById(id: string): Promise<DbProfile | null>;
  findByUserId(userId: string): Promise<DbProfile | null>;
  create(data: DbNewProfile): Promise<DbProfile>;
  update(id: string, data: Partial<DbNewProfile>): Promise<DbProfile>;
  addEducation(profileId: string, data: typeof education.$inferInsert): Promise<typeof education.$inferSelect>;
  addExperience(profileId: string, data: typeof experience.$inferInsert): Promise<typeof experience.$inferSelect>;
  addSkill(profileId: string, data: typeof skill.$inferInsert): Promise<typeof skill.$inferSelect>;
}

// Resume Repository Contract
export interface IResumeRepository {
  findById(id: string): Promise<DbResume | null>;
  findByUserId(userId: string): Promise<DbResume[]>;
  create(data: DbNewResume): Promise<DbResume>;
  update(id: string, data: Partial<DbNewResume>): Promise<DbResume>;
  delete(id: string): Promise<boolean>;
}

// Project Repository Contract
export interface IProjectRepository {
  findById(id: string): Promise<DbProject | null>;
  findByUserId(userId: string): Promise<DbProject[]>;
  create(data: DbNewProject): Promise<DbProject>;
  update(id: string, data: Partial<DbNewProject>): Promise<DbProject>;
  delete(id: string): Promise<boolean>;
}

// Portfolio Repository Contract
export interface IPortfolioRepository {
  findById(id: string): Promise<typeof portfolio.$inferSelect | null>;
  findByUserId(userId: string): Promise<typeof portfolio.$inferSelect | null>;
  findBySlug(slug: string): Promise<typeof portfolio.$inferSelect | null>;
  create(data: typeof portfolio.$inferInsert): Promise<typeof portfolio.$inferSelect>;
  update(id: string, data: Partial<typeof portfolio.$inferInsert>): Promise<typeof portfolio.$inferSelect>;
}

// DSA Repository Contract
export interface IDsaRepository {
  findProblemById(id: string): Promise<typeof dsaProblem.$inferSelect | null>;
  findProblemsByUserId(userId: string): Promise<Array<typeof dsaProblem.$inferSelect>>;
  createProblem(data: typeof dsaProblem.$inferInsert): Promise<typeof dsaProblem.$inferSelect>;
  createRevision(data: typeof dsaRevision.$inferInsert): Promise<typeof dsaRevision.$inferSelect>;
}

// Interview Session Repository Contract
export interface IInterviewRepository {
  findSessionById(id: string): Promise<typeof interviewSession.$inferSelect | null>;
  findSessionsByUserId(userId: string): Promise<Array<typeof interviewSession.$inferSelect>>;
  createSession(data: typeof interviewSession.$inferInsert): Promise<typeof interviewSession.$inferSelect>;
  addFeedback(sessionId: string, data: typeof interviewFeedback.$inferInsert): Promise<typeof interviewFeedback.$inferSelect>;
}
