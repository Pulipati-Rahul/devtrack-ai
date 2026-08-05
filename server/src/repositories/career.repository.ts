import { db } from '../db/database';
import { eq } from 'drizzle-orm';
import { careerReport, careerGoal, careerRoadmap, careerRecommendation } from '../db/schema';

export class CareerRepository {
  // --- 1. Reports Queries ---
  async getLatestReport(userId: string) {
    const [result] = await db
      .select()
      .from(careerReport)
      .where(eq(careerReport.userId, userId))
      .orderBy(careerReport.createdAt)
      .limit(1);
    return result || null;
  }

  async createReport(userId: string, report: any) {
    const [result] = await db
      .insert(careerReport)
      .values({ userId, report })
      .returning();
    return result;
  }

  // --- 2. Goals Queries ---
  async listGoals(userId: string) {
    return await db
      .select()
      .from(careerGoal)
      .where(eq(careerGoal.userId, userId))
      .orderBy(careerGoal.createdAt);
  }

  async createGoal(userId: string, data: { title: string; description?: string; targetDate?: Date; status?: string; aiGenerated?: boolean }) {
    const [result] = await db
      .insert(careerGoal)
      .values({
        userId,
        title: data.title,
        description: data.description || null,
        targetDate: data.targetDate || null,
        status: data.status || 'Pending',
        aiGenerated: data.aiGenerated ?? false,
      })
      .returning();
    return result;
  }

  async updateGoal(id: string, data: { title?: string; description?: string; targetDate?: Date; status?: string }) {
    const [result] = await db
      .update(careerGoal)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(careerGoal.id, id))
      .returning();
    return result;
  }

  async deleteGoal(id: string) {
    return await db.delete(careerGoal).where(eq(careerGoal.id, id)).returning();
  }

  // --- 3. Roadmap Queries ---
  async getRoadmap(userId: string) {
    const [result] = await db
      .select()
      .from(careerRoadmap)
      .where(eq(careerRoadmap.userId, userId))
      .limit(1);
    return result || null;
  }

  async upsertRoadmap(userId: string, steps: any) {
    const existing = await this.getRoadmap(userId);
    if (existing) {
      const [result] = await db
        .update(careerRoadmap)
        .set({ steps, updatedAt: new Date() })
        .where(eq(careerRoadmap.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(careerRoadmap)
        .values({ userId, title: 'My Career Roadmap', steps })
        .returning();
      return result;
    }
  }

  // --- 4. Recommendations Queries ---
  async listRecommendations(userId: string) {
    return await db
      .select()
      .from(careerRecommendation)
      .where(eq(careerRecommendation.userId, userId))
      .orderBy(careerRecommendation.createdAt);
  }

  async bulkInsertRecommendations(userId: string, items: { type: string; title: string; link?: string }[]) {
    // Delete existing recommendation logs first to refresh
    await db.delete(careerRecommendation).where(eq(careerRecommendation.userId, userId));

    if (items.length === 0) return [];
    return await db
      .insert(careerRecommendation)
      .values(
        items.map((item) => ({
          userId,
          type: item.type,
          title: item.title,
          link: item.link || null,
        }))
      )
      .returning();
  }

  async toggleRecommendationCompleted(id: string, completed: boolean) {
    const [result] = await db
      .update(careerRecommendation)
      .set({ completed, updatedAt: new Date() })
      .where(eq(careerRecommendation.id, id))
      .returning();
    return result;
  }
}
export const careerRepository = new CareerRepository();
