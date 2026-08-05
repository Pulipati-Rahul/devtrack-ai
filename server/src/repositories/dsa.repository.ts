import { db } from '../db/database';
import { eq, and, lte } from 'drizzle-orm';
import { dsaProblem, dsaRevision } from '../db/schema';

export class DsaRepository {
  // --- 1. Problem CRUD ---
  async listProblems(userId: string) {
    const rows = await db
      .select({
        problem: dsaProblem,
        revision: dsaRevision,
      })
      .from(dsaProblem)
      .leftJoin(dsaRevision, eq(dsaProblem.id, dsaRevision.problemId))
      .where(eq(dsaProblem.userId, userId))
      .orderBy(dsaProblem.solvedDate);
    
    return rows.map((r) => ({
      ...r.problem,
      revision: r.revision || null,
    }));
  }

  async getProblemById(id: string) {
    const [result] = await db
      .select({
        problem: dsaProblem,
        revision: dsaRevision,
      })
      .from(dsaProblem)
      .leftJoin(dsaRevision, eq(dsaProblem.id, dsaRevision.problemId))
      .where(eq(dsaProblem.id, id))
      .limit(1);

    if (!result) return null;
    return {
      ...result.problem,
      revision: result.revision || null,
    };
  }

  async createProblem(data: typeof dsaProblem.$inferInsert) {
    const [result] = await db.insert(dsaProblem).values(data).returning();
    return result;
  }

  async updateProblem(id: string, data: Partial<typeof dsaProblem.$inferInsert>) {
    const [result] = await db
      .update(dsaProblem)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dsaProblem.id, id))
      .returning();
    return result;
  }

  async deleteProblem(id: string) {
    const [result] = await db.delete(dsaProblem).where(eq(dsaProblem.id, id)).returning();
    return result;
  }

  // --- 2. Revision Operations ---
  async getRevisionByProblemId(problemId: string) {
    const [result] = await db
      .select()
      .from(dsaRevision)
      .where(eq(dsaRevision.problemId, problemId))
      .limit(1);
    return result || null;
  }

  async upsertRevision(
    problemId: string,
    nextRevision: Date,
    revisionCount: number,
    lastRevision?: Date
  ) {
    const existing = await this.getRevisionByProblemId(problemId);
    if (existing) {
      const [result] = await db
        .update(dsaRevision)
        .set({
          nextRevision,
          revisionCount,
          lastRevision: lastRevision || existing.lastRevision,
          updatedAt: new Date(),
        })
        .where(eq(dsaRevision.problemId, problemId))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(dsaRevision)
        .values({
          problemId,
          nextRevision,
          revisionCount,
          lastRevision: lastRevision || null,
        })
        .returning();
      return result;
    }
  }

  async listAllRevisions(userId: string) {
    const rows = await db
      .select({
        revision: dsaRevision,
        problem: dsaProblem,
      })
      .from(dsaRevision)
      .innerJoin(dsaProblem, eq(dsaRevision.problemId, dsaProblem.id))
      .where(eq(dsaProblem.userId, userId))
      .orderBy(dsaRevision.nextRevision);
    
    return rows.map((r) => ({
      ...r.revision,
      problem: r.problem,
    }));
  }

  async listRevisionsDue(userId: string) {
    const now = new Date();
    const rows = await db
      .select({
        revision: dsaRevision,
        problem: dsaProblem,
      })
      .from(dsaRevision)
      .innerJoin(dsaProblem, eq(dsaRevision.problemId, dsaProblem.id))
      .where(and(eq(dsaProblem.userId, userId), lte(dsaRevision.nextRevision, now)))
      .orderBy(dsaRevision.nextRevision);

    return rows.map((r) => ({
      ...r.revision,
      problem: r.problem,
    }));
  }
}
export const dsaRepository = new DsaRepository();
