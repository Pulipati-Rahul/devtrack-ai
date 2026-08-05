import { db } from '../db/database';
import { eq, avg, max, count } from 'drizzle-orm';
import { atsAnalysis } from '../db/schema';

export class ATSRepository {
  async listAnalyses(userId: string) {
    return await db
      .select()
      .from(atsAnalysis)
      .where(eq(atsAnalysis.userId, userId))
      .orderBy(atsAnalysis.createdAt);
  }

  async getAnalysisById(id: string) {
    const [result] = await db
      .select()
      .from(atsAnalysis)
      .where(eq(atsAnalysis.id, id))
      .limit(1);
    return result || null;
  }

  async createAnalysis(data: typeof atsAnalysis.$inferInsert) {
    const [result] = await db.insert(atsAnalysis).values(data).returning();
    return result;
  }

  async deleteAnalysis(id: string) {
    const [result] = await db
      .delete(atsAnalysis)
      .where(eq(atsAnalysis.id, id))
      .returning();
    return result;
  }

  async getAnalysisStats(userId: string) {
    const [stats] = await db
      .select({
        avgScore: avg(atsAnalysis.atsScore),
        bestScore: max(atsAnalysis.atsScore),
        totalCount: count(atsAnalysis.id),
      })
      .from(atsAnalysis)
      .where(eq(atsAnalysis.userId, userId));
    
    return {
      avgScore: stats?.avgScore ? Math.round(parseFloat(stats.avgScore)) : 0,
      bestScore: stats?.bestScore || 0,
      totalCount: stats?.totalCount || 0,
    };
  }
}
export const atsRepository = new ATSRepository();
