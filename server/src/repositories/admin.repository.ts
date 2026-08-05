import { db } from '../db/database';
import { eq, and, like, or, sql, count, desc } from 'drizzle-orm';
import { user, resume, project, portfolio, aiMessage, activityLog, session } from '../db/schema';

export class AdminRepository {
  async getDashboardMetrics() {
    const [usersCount] = await db.select({ value: count() }).from(user);
    const [resumesCount] = await db.select({ value: count() }).from(resume);
    const [projectsCount] = await db.select({ value: count() }).from(project);
    const [portfoliosCount] = await db.select({ value: count() }).from(portfolio);
    const [aiCount] = await db.select({ value: count() }).from(aiMessage);

    // Active session counts representing active users
    const [activeSessions] = await db
      .select({ value: count() })
      .from(session)
      .where(sql`expires_at > now()`);

    return {
      totalUsers: usersCount?.value || 0,
      activeUsers: activeSessions?.value || 0,
      totalResumes: resumesCount?.value || 0,
      totalProjects: projectsCount?.value || 0,
      totalPortfolios: portfoliosCount?.value || 0,
      totalAiRequests: aiCount?.value || 0,
    };
  }

  async getUsers(search: string = '', role?: string, limit: number = 10, offset: number = 0) {
    let query = db.select().from(user);

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`)
        )
      );
    }
    if (role) {
      conditions.push(eq(user.role, role as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(user.createdAt));
  }

  async getUserDetails(userId: string) {
    const [profile] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!profile) return null;

    const [resumesCount] = await db.select({ value: count() }).from(resume).where(eq(resume.userId, userId));
    const [projectsCount] = await db.select({ value: count() }).from(project).where(eq(project.userId, userId));
    const userPortfolios = await db.select().from(portfolio).where(eq(portfolio.userId, userId));
    const [aiCount] = await db.select({ value: count() }).from(aiMessage).innerJoin(session, eq(aiMessage.conversationId, session.id)).where(eq(session.userId, userId));

    return {
      profile,
      resumeCount: resumesCount?.value || 0,
      projectCount: projectsCount?.value || 0,
      portfolios: userPortfolios,
      aiRequestsCount: aiCount?.value || 0,
    };
  }

  async updateUser(userId: string, data: { role?: 'USER' | 'ADMIN'; name?: string }) {
    const [updated] = await db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();
    return updated;
  }

  async deleteUser(userId: string) {
    const [deleted] = await db.delete(user).where(eq(user.id, userId)).returning();
    return deleted;
  }

  async getActivityLogs(limit: number = 20, offset: number = 0) {
    return await db
      .select()
      .from(activityLog)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(activityLog.createdAt));
  }
}
export const adminRepository = new AdminRepository();
