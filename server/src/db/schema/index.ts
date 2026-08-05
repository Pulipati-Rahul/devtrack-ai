import { relations } from 'drizzle-orm';
import { user, session, account } from './user';
import { profile, education, experience, skill, certification, achievement } from './profile';
import { resume, resumeSection } from './resume';
import { project, projectTask, projectNote, projectAttachment, projectResource } from './project';
import { portfolio, portfolioProject } from './portfolio';
import { dsaProblem, dsaRevision } from './dsa';
import { interviewSession, interviewFeedback, interviewQuestionState } from './interview';
import { aiConversation, aiMessage, activityLog, achievementUnlock, analyticsSnapshot, analyticsReport } from './analytics';
import { userSetting } from './settings';
import { atsAnalysis } from './ats';
import { searchHistory, pinnedCommand } from './search';
import { careerReport, careerGoal, careerRoadmap, careerRecommendation } from './career';

// Export schemas
export * from './user';
export * from './profile';
export * from './resume';
export * from './project';
export * from './portfolio';
export * from './dsa';
export * from './interview';
export * from './analytics';
export * from './settings';
export * from './admin';
export * from './ats';
export * from './search';
export * from './career';

// User Relations
export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profile, {
    fields: [user.id],
    references: [profile.userId],
  }),
  resumes: many(resume),
  projects: many(project),
  portfolios: many(portfolio),
  dsaProblems: many(dsaProblem),
  interviewSessions: many(interviewSession),
  aiConversations: many(aiConversation),
  activityLogs: many(activityLog),
  achievementUnlocks: many(achievementUnlock),
  atsAnalyses: many(atsAnalysis),
  analyticsSnapshots: many(analyticsSnapshot),
  analyticsReports: many(analyticsReport),
  interviewQuestionStates: many(interviewQuestionState),
  settings: one(userSetting, {
    fields: [user.id],
    references: [userSetting.userId],
  }),
  sessions: many(session),
  accounts: many(account),
  searchHistories: many(searchHistory),
  pinnedCommands: many(pinnedCommand),
  careerReports: many(careerReport),
  careerGoals: many(careerGoal),
  careerRoadmaps: many(careerRoadmap),
  careerRecommendations: many(careerRecommendation),
}));

// Profile Relations
export const profileRelations = relations(profile, ({ one, many }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
  educations: many(education),
  experiences: many(experience),
  skills: many(skill),
  certifications: many(certification),
  achievements: many(achievement),
}));

// Education Relations
export const educationRelations = relations(education, ({ one }) => ({
  profile: one(profile, {
    fields: [education.profileId],
    references: [profile.id],
  }),
}));

// Experience Relations
export const experienceRelations = relations(experience, ({ one }) => ({
  profile: one(profile, {
    fields: [experience.profileId],
    references: [profile.id],
  }),
}));

// Skill Relations
export const skillRelations = relations(skill, ({ one }) => ({
  profile: one(profile, {
    fields: [skill.profileId],
    references: [profile.id],
  }),
}));

// Certification Relations
export const certificationRelations = relations(certification, ({ one }) => ({
  profile: one(profile, {
    fields: [certification.profileId],
    references: [profile.id],
  }),
}));

// Achievement Relations
export const achievementRelations = relations(achievement, ({ one }) => ({
  profile: one(profile, {
    fields: [achievement.profileId],
    references: [profile.id],
  }),
}));

// Resume Relations
export const resumeRelations = relations(resume, ({ one, many }) => ({
  user: one(user, {
    fields: [resume.userId],
    references: [user.id],
  }),
  sections: many(resumeSection),
}));

// Resume Section Relations
export const resumeSectionRelations = relations(resumeSection, ({ one }) => ({
  resume: one(resume, {
    fields: [resumeSection.resumeId],
    references: [resume.id],
  }),
}));

// Project Relations
export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  tasks: many(projectTask),
  notes: many(projectNote),
  attachments: many(projectAttachment),
  resources: many(projectResource),
  portfolioProjects: many(portfolioProject),
}));

// Project Task Relations
export const projectTaskRelations = relations(projectTask, ({ one }) => ({
  project: one(project, {
    fields: [projectTask.projectId],
    references: [project.id],
  }),
}));

// Project Note Relations
export const projectNoteRelations = relations(projectNote, ({ one }) => ({
  project: one(project, {
    fields: [projectNote.projectId],
    references: [project.id],
  }),
}));

// Project Attachment Relations
export const projectAttachmentRelations = relations(projectAttachment, ({ one }) => ({
  project: one(project, {
    fields: [projectAttachment.projectId],
    references: [project.id],
  }),
}));

// Project Resource Relations
export const projectResourceRelations = relations(projectResource, ({ one }) => ({
  project: one(project, {
    fields: [projectResource.projectId],
    references: [project.id],
  }),
}));

// Portfolio Relations
export const portfolioRelations = relations(portfolio, ({ one, many }) => ({
  user: one(user, {
    fields: [portfolio.userId],
    references: [user.id],
  }),
  portfolioProjects: many(portfolioProject),
}));

// Portfolio Project Relations
export const portfolioProjectRelations = relations(portfolioProject, ({ one }) => ({
  portfolio: one(portfolio, {
    fields: [portfolioProject.portfolioId],
    references: [portfolio.id],
  }),
  project: one(project, {
    fields: [portfolioProject.projectId],
    references: [project.id],
  }),
}));

// DSA Problem Relations
export const dsaProblemRelations = relations(dsaProblem, ({ one, many }) => ({
  user: one(user, {
    fields: [dsaProblem.userId],
    references: [user.id],
  }),
  revisions: many(dsaRevision),
}));

// DSA Revision Relations
export const dsaRevisionRelations = relations(dsaRevision, ({ one }) => ({
  problem: one(dsaProblem, {
    fields: [dsaRevision.problemId],
    references: [dsaProblem.id],
  }),
}));

// Interview Session Relations
export const interviewSessionRelations = relations(interviewSession, ({ one, many }) => ({
  user: one(user, {
    fields: [interviewSession.userId],
    references: [user.id],
  }),
  feedbacks: many(interviewFeedback),
}));

// Interview Feedback Relations
export const interviewFeedbackRelations = relations(interviewFeedback, ({ one }) => ({
  session: one(interviewSession, {
    fields: [interviewFeedback.sessionId],
    references: [interviewSession.id],
  }),
}));

// AI Conversation Relations
export const aiConversationRelations = relations(aiConversation, ({ one, many }) => ({
  user: one(user, {
    fields: [aiConversation.userId],
    references: [user.id],
  }),
  messages: many(aiMessage),
}));

// AI Message Relations
export const aiMessageRelations = relations(aiMessage, ({ one }) => ({
  conversation: one(aiConversation, {
    fields: [aiMessage.conversationId],
    references: [aiConversation.id],
  }),
}));

// Activity Log Relations
export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(user, {
    fields: [activityLog.userId],
    references: [user.id],
  }),
}));

// Achievement Unlock Relations
export const achievementUnlockRelations = relations(achievementUnlock, ({ one }) => ({
  user: one(user, {
    fields: [achievementUnlock.userId],
    references: [user.id],
  }),
}));

// User Setting Relations
export const userSettingRelations = relations(userSetting, ({ one }) => ({
  user: one(user, {
    fields: [userSetting.userId],
    references: [user.id],
  }),
}));

// Session Relations
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// Account Relations
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ATS Analysis Relations
export const atsAnalysisRelations = relations(atsAnalysis, ({ one }) => ({
  user: one(user, {
    fields: [atsAnalysis.userId],
    references: [user.id],
  }),
  resume: one(resume, {
    fields: [atsAnalysis.resumeId],
    references: [resume.id],
  }),
}));

// Interview Question State Relations
export const interviewQuestionStateRelations = relations(interviewQuestionState, ({ one }) => ({
  user: one(user, {
    fields: [interviewQuestionState.userId],
    references: [user.id],
  }),
}));

// Career Report Relations
export const careerReportRelations = relations(careerReport, ({ one }) => ({
  user: one(user, {
    fields: [careerReport.userId],
    references: [user.id],
  }),
}));

// Career Goal Relations
export const careerGoalRelations = relations(careerGoal, ({ one }) => ({
  user: one(user, {
    fields: [careerGoal.userId],
    references: [user.id],
  }),
}));

// Career Roadmap Relations
export const careerRoadmapRelations = relations(careerRoadmap, ({ one }) => ({
  user: one(user, {
    fields: [careerRoadmap.userId],
    references: [user.id],
  }),
}));

// Career Recommendation Relations
export const careerRecommendationRelations = relations(careerRecommendation, ({ one }) => ({
  user: one(user, {
    fields: [careerRecommendation.userId],
    references: [user.id],
  }),
}));
