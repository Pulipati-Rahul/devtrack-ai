import { db } from '../db/database';
import { eq, and } from 'drizzle-orm';
import { interviewSession, interviewFeedback, interviewQuestionState } from '../db/schema';

export class InterviewRepository {
  // --- 1. Question State Mapping ---
  async listQuestionStates(userId: string) {
    return await db
      .select()
      .from(interviewQuestionState)
      .where(eq(interviewQuestionState.userId, userId));
  }

  async getQuestionState(userId: string, questionId: string) {
    const [result] = await db
      .select()
      .from(interviewQuestionState)
      .where(
        and(
          eq(interviewQuestionState.userId, userId),
          eq(interviewQuestionState.questionId, questionId)
        )
      )
      .limit(1);
    return result || null;
  }

  async upsertQuestionState(
    userId: string,
    questionId: string,
    data: { bookmarked?: boolean; solved?: boolean }
  ) {
    const existing = await this.getQuestionState(userId, questionId);
    if (existing) {
      const [result] = await db
        .update(interviewQuestionState)
        .set({
          bookmarked: data.bookmarked !== undefined ? data.bookmarked : existing.bookmarked,
          solved: data.solved !== undefined ? data.solved : existing.solved,
          updatedAt: new Date(),
        })
        .where(eq(interviewQuestionState.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(interviewQuestionState)
        .values({
          userId,
          questionId,
          bookmarked: data.bookmarked ?? false,
          solved: data.solved ?? false,
        })
        .returning();
      return result;
    }
  }

  // --- 2. Session CRUD Operations ---
  async listSessions(userId: string) {
    const rows = await db
      .select({
        session: interviewSession,
        feedback: interviewFeedback,
      })
      .from(interviewSession)
      .leftJoin(interviewFeedback, eq(interviewSession.id, interviewFeedback.sessionId))
      .where(eq(interviewSession.userId, userId))
      .orderBy(interviewSession.startedAt);

    return rows.map((r) => ({
      ...r.session,
      feedback: r.feedback || null,
    }));
  }

  async getSessionById(id: string) {
    const [result] = await db
      .select({
        session: interviewSession,
        feedback: interviewFeedback,
      })
      .from(interviewSession)
      .leftJoin(interviewFeedback, eq(interviewSession.id, interviewFeedback.sessionId))
      .where(eq(interviewSession.id, id))
      .limit(1);

    if (!result) return null;
    return {
      ...result.session,
      feedback: result.feedback || null,
    };
  }

  async createSession(data: typeof interviewSession.$inferInsert) {
    const [result] = await db.insert(interviewSession).values(data).returning();
    return result;
  }

  async updateSession(id: string, data: Partial<typeof interviewSession.$inferInsert>) {
    const [result] = await db
      .update(interviewSession)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(interviewSession.id, id))
      .returning();
    return result;
  }

  async deleteSession(id: string) {
    const [result] = await db.delete(interviewSession).where(eq(interviewSession.id, id)).returning();
    return result;
  }

  // --- 3. Feedback Operations ---
  async getFeedbackBySessionId(sessionId: string) {
    const [result] = await db
      .select()
      .from(interviewFeedback)
      .where(eq(interviewFeedback.sessionId, sessionId))
      .limit(1);
    return result || null;
  }

  async upsertFeedback(
    sessionId: string,
    data: { feedback: string; rating: number; strengths?: string; weaknesses?: string }
  ) {
    const existing = await this.getFeedbackBySessionId(sessionId);
    if (existing) {
      const [result] = await db
        .update(interviewFeedback)
        .set({
          feedback: data.feedback,
          rating: data.rating,
          strengths: data.strengths || null,
          weaknesses: data.weaknesses || null,
          updatedAt: new Date(),
        })
        .where(eq(interviewFeedback.sessionId, sessionId))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(interviewFeedback)
        .values({
          sessionId,
          feedback: data.feedback,
          rating: data.rating,
          strengths: data.strengths || null,
          weaknesses: data.weaknesses || null,
        })
        .returning();
      return result;
    }
  }
}
export const interviewRepository = new InterviewRepository();
