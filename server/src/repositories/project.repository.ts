import { db } from '../db/database';
import { eq } from 'drizzle-orm';
import { project, projectTask, projectNote, projectResource, projectAttachment } from '../db/schema';

export class ProjectRepository {
  // --- 1. Project CRUD ---
  async listProjects(userId: string) {
    return await db
      .select()
      .from(project)
      .where(eq(project.userId, userId))
      .orderBy(project.createdAt);
  }

  async getProjectById(id: string) {
    const [result] = await db
      .select()
      .from(project)
      .where(eq(project.id, id))
      .limit(1);
    return result || null;
  }

  async createProject(data: typeof project.$inferInsert) {
    const [result] = await db.insert(project).values(data).returning();
    return result;
  }

  async updateProject(id: string, data: Partial<typeof project.$inferInsert>) {
    const [result] = await db
      .update(project)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(project.id, id))
      .returning();
    return result;
  }

  async deleteProject(id: string) {
    const [result] = await db.delete(project).where(eq(project.id, id)).returning();
    return result;
  }

  async getProjectStats(userId: string) {
    const all = await this.listProjects(userId);
    
    const totalCount = all.length;
    const activeCount = all.filter((p) => p.status !== 'Completed' && p.status !== 'Archived').length;
    const completedCount = all.filter((p) => p.status === 'Completed').length;
    const archivedCount = all.filter((p) => p.status === 'Archived').length;
    
    const sumProgress = all.reduce((sum, p) => sum + (p.progress || 0), 0);
    const avgProgress = totalCount > 0 ? Math.round(sumProgress / totalCount) : 0;

    return {
      totalCount,
      activeCount,
      completedCount,
      archivedCount,
      avgProgress,
    };
  }

  async duplicateProject(id: string, newTitle: string) {
    return await db.transaction(async (tx) => {
      const source = await this.getProjectById(id);
      if (!source) return null;

      // 1. Duplicate project row
      const [newProj] = await tx
        .insert(project)
        .values({
          userId: source.userId,
          title: newTitle,
          description: source.description,
          status: 'Planning',
          priority: source.priority,
          githubUrl: source.githubUrl,
          liveUrl: source.liveUrl,
          technologies: source.technologies,
          startDate: source.startDate,
          targetDate: source.targetDate,
          progress: 0,
        })
        .returning();

      // 2. Duplicate tasks
      const tasks = await tx.select().from(projectTask).where(eq(projectTask.projectId, id));
      if (tasks.length > 0) {
        const tasksToInsert = tasks.map((t) => ({
          projectId: newProj.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          assignedTo: t.assignedTo,
          tags: t.tags,
          notes: t.notes,
        }));
        await tx.insert(projectTask).values(tasksToInsert);
      }

      // 3. Duplicate notes
      const notes = await tx.select().from(projectNote).where(eq(projectNote.projectId, id));
      if (notes.length > 0) {
        const notesToInsert = notes.map((n) => ({
          projectId: newProj.id,
          title: n.title,
          content: n.content,
        }));
        await tx.insert(projectNote).values(notesToInsert);
      }

      // 4. Duplicate resources
      const resources = await tx.select().from(projectResource).where(eq(projectResource.projectId, id));
      if (resources.length > 0) {
        const resToInsert = resources.map((r) => ({
          projectId: newProj.id,
          title: r.title,
          url: r.url,
          category: r.category,
        }));
        await tx.insert(projectResource).values(resToInsert);
      }

      // 5. Duplicate attachments
      const attachments = await tx.select().from(projectAttachment).where(eq(projectAttachment.projectId, id));
      if (attachments.length > 0) {
        const attToInsert = attachments.map((a) => ({
          projectId: newProj.id,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
        }));
        await tx.insert(projectAttachment).values(attToInsert);
      }

      return newProj;
    });
  }

  // --- 2. Task CRUD ---
  async getProjectTasks(projectId: string) {
    return await db.select().from(projectTask).where(eq(projectTask.projectId, projectId));
  }

  async getTaskById(id: string) {
    const [result] = await db.select().from(projectTask).where(eq(projectTask.id, id)).limit(1);
    return result || null;
  }

  async createTask(data: typeof projectTask.$inferInsert) {
    const [result] = await db.insert(projectTask).values(data).returning();
    return result;
  }

  async updateTask(id: string, data: Partial<typeof projectTask.$inferInsert>) {
    const [result] = await db
      .update(projectTask)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projectTask.id, id))
      .returning();
    return result;
  }

  async deleteTask(id: string) {
    const [result] = await db.delete(projectTask).where(eq(projectTask.id, id)).returning();
    return result;
  }

  // --- 3. Note CRUD ---
  async getProjectNotes(projectId: string) {
    return await db.select().from(projectNote).where(eq(projectNote.projectId, projectId));
  }

  async getNoteById(id: string) {
    const [result] = await db.select().from(projectNote).where(eq(projectNote.id, id)).limit(1);
    return result || null;
  }

  async createNote(data: typeof projectNote.$inferInsert) {
    const [result] = await db.insert(projectNote).values(data).returning();
    return result;
  }

  async updateNote(id: string, data: Partial<typeof projectNote.$inferInsert>) {
    const [result] = await db
      .update(projectNote)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projectNote.id, id))
      .returning();
    return result;
  }

  async deleteNote(id: string) {
    const [result] = await db.delete(projectNote).where(eq(projectNote.id, id)).returning();
    return result;
  }

  // --- 4. Resource CRUD ---
  async getProjectResources(projectId: string) {
    return await db.select().from(projectResource).where(eq(projectResource.projectId, projectId));
  }

  async getResourceById(id: string) {
    const [result] = await db.select().from(projectResource).where(eq(projectResource.id, id)).limit(1);
    return result || null;
  }

  async createResource(data: typeof projectResource.$inferInsert) {
    const [result] = await db.insert(projectResource).values(data).returning();
    return result;
  }

  async deleteResource(id: string) {
    const [result] = await db.delete(projectResource).where(eq(projectResource.id, id)).returning();
    return result;
  }

  // --- 5. Attachment CRUD ---
  async getProjectAttachments(projectId: string) {
    return await db.select().from(projectAttachment).where(eq(projectAttachment.projectId, projectId));
  }

  async getAttachmentById(id: string) {
    const [result] = await db.select().from(projectAttachment).where(eq(projectAttachment.id, id)).limit(1);
    return result || null;
  }

  async createAttachment(data: typeof projectAttachment.$inferInsert) {
    const [result] = await db.insert(projectAttachment).values(data).returning();
    return result;
  }

  async deleteAttachment(id: string) {
    const [result] = await db.delete(projectAttachment).where(eq(projectAttachment.id, id)).returning();
    return result;
  }
}
export const projectRepository = new ProjectRepository();
