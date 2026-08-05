import { db } from '../db/database';
import { eq, and, gte, sql } from 'drizzle-orm';
import {
  resume,
  project,
  projectTask,
  dsaProblem,
  dsaRevision,
  interviewSession,
  activityLog,
  profile,
  education,
  experience,
  skill,
  certification,
  achievement,
  portfolio,
  analyticsSnapshot,
  analyticsReport,
} from '../db/schema';

export class AnalyticsRepository {
  async getResumesCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(resume)
      .where(eq(resume.userId, userId));
    return result[0]?.count ? Number(result[0].count) : 0;
  }

  async getProjectsCounts(userId: string) {
    const result = await db
      .select({
        status: project.status,
        count: sql<number>`count(*)`,
      })
      .from(project)
      .where(eq(project.userId, userId))
      .groupBy(project.status);

    let active = 0;
    let completed = 0;
    let total = 0;

    result.forEach((r) => {
      const count = Number(r.count);
      total += count;
      if (r.status === 'In Progress' || r.status === 'Planning' || r.status === 'Testing') {
        active += count;
      } else if (r.status === 'Completed') {
        completed += count;
      }
    });

    return { active, completed, total };
  }

  async getTasksCounts(userId: string) {
    const result = await db
      .select({
        status: projectTask.status,
        count: sql<number>`count(*)`,
      })
      .from(projectTask)
      .innerJoin(project, eq(projectTask.projectId, project.id))
      .where(eq(project.userId, userId))
      .groupBy(projectTask.status);

    let completed = 0;
    let total = 0;

    result.forEach((r) => {
      const count = Number(r.count);
      total += count;
      if (r.status === 'Completed' || r.status === 'Done') {
        completed += count;
      }
    });

    return { completed, total };
  }

  async getDsaProblemsCounts(userId: string) {
    const result = await db
      .select({
        difficulty: dsaProblem.difficulty,
        count: sql<number>`count(*)`,
      })
      .from(dsaProblem)
      .where(eq(dsaProblem.userId, userId))
      .groupBy(dsaProblem.difficulty);

    let easy = 0;
    let medium = 0;
    let hard = 0;
    let total = 0;

    result.forEach((r) => {
      const count = Number(r.count);
      total += count;
      if (r.difficulty.toLowerCase() === 'easy') easy = count;
      else if (r.difficulty.toLowerCase() === 'medium') medium = count;
      else if (r.difficulty.toLowerCase() === 'hard') hard = count;
    });

    return { easy, medium, hard, total };
  }

  async getDsaProblemsSolvedTodayCount(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(dsaProblem)
      .where(
        and(
          eq(dsaProblem.userId, userId),
          gte(dsaProblem.solvedDate, startOfDay)
        )
      );

    return result[0]?.count ? Number(result[0].count) : 0;
  }

  async getDsaProblemSolveDates(userId: string): Promise<Date[]> {
    const result = await db
      .select({ solvedDate: dsaProblem.solvedDate })
      .from(dsaProblem)
      .where(eq(dsaProblem.userId, userId))
      .orderBy(sql`${dsaProblem.solvedDate} asc`);
    
    return result.map(r => r.solvedDate);
  }

  async getInterviewSessionsCounts(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(interviewSession)
      .where(eq(interviewSession.userId, userId));
    return result[0]?.count ? Number(result[0].count) : 0;
  }

  async getLatestInterviewSession(userId: string) {
    const result = await db
      .select()
      .from(interviewSession)
      .where(eq(interviewSession.userId, userId))
      .orderBy(sql`${interviewSession.createdAt} desc`)
      .limit(1);
    
    return result[0] || null;
  }

  async getProfileCompletenessDetails(userId: string) {
    const userProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    if (!userProfile[0]) return null;

    const profileId = userProfile[0].id;

    const [educationsCount, experiencesCount, skillsCount, certificationsCount, achievementsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(education).where(eq(education.profileId, profileId)),
      db.select({ count: sql<number>`count(*)` }).from(experience).where(eq(experience.profileId, profileId)),
      db.select({ count: sql<number>`count(*)` }).from(skill).where(eq(skill.profileId, profileId)),
      db.select({ count: sql<number>`count(*)` }).from(certification).where(eq(certification.profileId, profileId)),
      db.select({ count: sql<number>`count(*)` }).from(achievement).where(eq(achievement.profileId, profileId)),
    ]);

    return {
      bio: userProfile[0].bio || '',
      fullName: userProfile[0].fullName || '',
      phone: userProfile[0].phone || '',
      githubUrl: userProfile[0].githubUrl || '',
      linkedinUrl: userProfile[0].linkedinUrl || '',
      educationsCount: educationsCount[0]?.count ? Number(educationsCount[0].count) : 0,
      experiencesCount: experiencesCount[0]?.count ? Number(experiencesCount[0].count) : 0,
      skillsCount: skillsCount[0]?.count ? Number(skillsCount[0].count) : 0,
      certificationsCount: certificationsCount[0]?.count ? Number(certificationsCount[0].count) : 0,
      achievementsCount: achievementsCount[0]?.count ? Number(achievementsCount[0].count) : 0,
    };
  }

  async getLatestResumes(userId: string) {
    return await db
      .select()
      .from(resume)
      .where(eq(resume.userId, userId))
      .orderBy(sql`${resume.updatedAt} desc`)
      .limit(3);
  }

  async getUpcomingProjectDeadlines(userId: string) {
    const now = new Date();
    return await db
      .select()
      .from(project)
      .where(
        and(
          eq(project.userId, userId),
          gte(project.targetDate, now),
          sql`${project.status} != 'Completed'`
        )
      )
      .orderBy(sql`${project.targetDate} asc`)
      .limit(3);
  }

  async getActivityLogs(userId: string) {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(sql`${activityLog.createdAt} desc`)
      .limit(10);
  }

  async getAllProjects(userId: string) {
    return await db
      .select()
      .from(project)
      .where(eq(project.userId, userId))
      .orderBy(project.createdAt);
  }

  async getAllResumes(userId: string) {
    return await db
      .select()
      .from(resume)
      .where(eq(resume.userId, userId))
      .orderBy(resume.createdAt);
  }

  async getAllDsaProblems(userId: string) {
    return await db
      .select()
      .from(dsaProblem)
      .where(eq(dsaProblem.userId, userId))
      .orderBy(dsaProblem.createdAt);
  }

  async getAllDsaRevisions(userId: string) {
    return await db
      .select({
        revision: dsaRevision,
        problem: dsaProblem,
      })
      .from(dsaRevision)
      .innerJoin(dsaProblem, eq(dsaRevision.problemId, dsaProblem.id))
      .where(eq(dsaProblem.userId, userId));
  }

  async getAllInterviewSessions(userId: string) {
    return await db
      .select()
      .from(interviewSession)
      .where(eq(interviewSession.userId, userId))
      .orderBy(interviewSession.createdAt);
  }

  async getPortfolioDetails(userId: string) {
    const result = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.userId, userId))
      .limit(1);
    return result[0] || null;
  }

  async saveSnapshot(userId: string, snapshotType: string, scores: any) {
    const [result] = await db
      .insert(analyticsSnapshot)
      .values({
        userId,
        snapshotType,
        scores,
        updatedAt: new Date(),
      })
      .returning();
    return result;
  }

  async listSnapshots(userId: string, snapshotType?: string) {
    const query = db
      .select()
      .from(analyticsSnapshot)
      .where(
        snapshotType
          ? and(
              eq(analyticsSnapshot.userId, userId),
              eq(analyticsSnapshot.snapshotType, snapshotType)
            )
          : eq(analyticsSnapshot.userId, userId)
      )
      .orderBy(sql`${analyticsSnapshot.createdAt} desc`);
    return await query;
  }

  async saveReport(userId: string, reportType: string, title: string, summary: string, insights: any, actionItems: any) {
    const [result] = await db
      .insert(analyticsReport)
      .values({
        userId,
        reportType,
        title,
        summary,
        insights,
        actionItems,
        updatedAt: new Date(),
      })
      .returning();
    return result;
  }

  async listReports(userId: string, reportType?: string) {
    const query = db
      .select()
      .from(analyticsReport)
      .where(
        reportType
          ? and(
              eq(analyticsReport.userId, userId),
              eq(analyticsReport.reportType, reportType)
            )
          : eq(analyticsReport.userId, userId)
      )
      .orderBy(sql`${analyticsReport.createdAt} desc`);
    return await query;
  }
}
export const analyticsRepository = new AnalyticsRepository();
