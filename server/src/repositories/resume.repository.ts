import { db } from '../db/database';
import { eq, and } from 'drizzle-orm';
import { resume, resumeSection } from '../db/schema';

export class ResumeRepository {
  async listResumes(userId: string) {
    return await db
      .select()
      .from(resume)
      .where(eq(resume.userId, userId))
      .orderBy(resume.updatedAt);
  }

  async getResumeById(id: string) {
    const [result] = await db
      .select()
      .from(resume)
      .where(eq(resume.id, id))
      .limit(1);
    return result || null;
  }

  async getResumeSections(resumeId: string) {
    return await db
      .select()
      .from(resumeSection)
      .where(eq(resumeSection.resumeId, resumeId))
      .orderBy(resumeSection.sortOrder);
  }

  async getResumeSectionByType(resumeId: string, sectionType: string) {
    const [result] = await db
      .select()
      .from(resumeSection)
      .where(
        and(
          eq(resumeSection.resumeId, resumeId),
          eq(resumeSection.sectionType, sectionType)
        )
      )
      .limit(1);
    return result || null;
  }

  async createResume(data: typeof resume.$inferInsert) {
    const [result] = await db.insert(resume).values(data).returning();
    return result;
  }

  async updateResume(id: string, data: Partial<typeof resume.$inferInsert>) {
    const [result] = await db
      .update(resume)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resume.id, id))
      .returning();
    return result;
  }

  async deleteResume(id: string) {
    const [result] = await db.delete(resume).where(eq(resume.id, id)).returning();
    return result;
  }

  async createResumeSection(data: typeof resumeSection.$inferInsert) {
    const [result] = await db.insert(resumeSection).values(data).returning();
    return result;
  }

  async updateResumeSection(id: string, data: Partial<typeof resumeSection.$inferInsert>) {
    const [result] = await db
      .update(resumeSection)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resumeSection.id, id))
      .returning();
    return result;
  }

  async setDefaultResume(userId: string, defaultResumeId: string) {
    return await db.transaction(async (tx) => {
      // Clear defaults
      await tx
        .update(resume)
        .set({ isDefault: false })
        .where(eq(resume.userId, userId));
      
      // Set new default
      const [updated] = await tx
        .update(resume)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(resume.id, defaultResumeId))
        .returning();
      
      return updated;
    });
  }

  async duplicateResume(id: string, newName: string) {
    return await db.transaction(async (tx) => {
      const sourceResume = await this.getResumeById(id);
      if (!sourceResume) return null;

      // 1. Insert duplicated resume
      const [newResume] = await tx
        .insert(resume)
        .values({
          userId: sourceResume.userId,
          name: newName,
          template: sourceResume.template,
          summary: sourceResume.summary,
          font: sourceResume.font,
          accentColor: sourceResume.accentColor,
          spacing: sourceResume.spacing,
          fontSize: sourceResume.fontSize,
          isDefault: false,
        })
        .returning();

      // 2. Query source sections
      const sourceSections = await tx
        .select()
        .from(resumeSection)
        .where(eq(resumeSection.resumeId, id));

      // 3. Copy sections
      if (sourceSections.length > 0) {
        const sectionsToInsert = sourceSections.map((sec) => ({
          resumeId: newResume.id,
          sectionType: sec.sectionType,
          sortOrder: sec.sortOrder,
          visible: sec.visible,
          content: sec.content,
        }));
        await tx.insert(resumeSection).values(sectionsToInsert);
      }

      return newResume;
    });
  }
}
export const resumeRepository = new ResumeRepository();
