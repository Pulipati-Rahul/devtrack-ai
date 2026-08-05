import { BaseService } from './base.service';
import { projectRepository } from '../repositories/project.repository';
import { NotFoundError, AuthorizationError } from '../errors/app-errors';

export class ProjectService extends BaseService {
  constructor() {
    super('ProjectService');
  }

  // --- Helper: Verify Ownership ---
  async verifyOwnership(userId: string, projectId: string) {
    const proj = await projectRepository.getProjectById(projectId);
    if (!proj) throw new NotFoundError('Project not found');
    if (proj.userId !== userId) throw new AuthorizationError('You do not own this project');
    return proj;
  }

  // --- helper: Recalculate Progress ---
  async recalculateProgress(projectId: string) {
    const tasks = await projectRepository.getProjectTasks(projectId);
    const total = tasks.length;
    if (total === 0) {
      await projectRepository.updateProject(projectId, { progress: 0 });
      return 0;
    }
    const doneCount = tasks.filter((t) => t.status === 'Done').length;
    const progress = Math.round((doneCount / total) * 100);
    
    // Automatically flag completed date if progress reaches 100%
    const completedDate = progress === 100 ? new Date() : null;
    await projectRepository.updateProject(projectId, { progress, completedDate });
    return progress;
  }

  // --- 1. Project Operations ---
  async listProjects(userId: string) {
    this.logInfo('Listing projects', { userId });
    return await projectRepository.listProjects(userId);
  }

  async getProjectDetails(userId: string, id: string) {
    this.logInfo('Fetching full project details', { userId, id });
    const proj = await this.verifyOwnership(userId, id);
    const tasks = await projectRepository.getProjectTasks(id);
    const notes = await projectRepository.getProjectNotes(id);
    const resources = await projectRepository.getProjectResources(id);
    const attachments = await projectRepository.getProjectAttachments(id);

    return {
      project: proj,
      tasks,
      notes,
      resources,
      attachments,
    };
  }

  async createProject(userId: string, data: any) {
    this.logInfo('Creating project', { userId });
    return await projectRepository.createProject({
      ...data,
      userId,
      progress: 0,
    });
  }

  async updateProject(userId: string, id: string, data: any) {
    this.logInfo('Updating project parameters', { userId, id });
    await this.verifyOwnership(userId, id);
    return await projectRepository.updateProject(id, data);
  }

  async deleteProject(userId: string, id: string) {
    this.logInfo('Deleting project', { userId, id });
    await this.verifyOwnership(userId, id);
    return await projectRepository.deleteProject(id);
  }

  async getStats(userId: string) {
    this.logInfo('Fetching project tracker stats', { userId });
    return await projectRepository.getProjectStats(userId);
  }

  async duplicateProject(userId: string, id: string, title: string) {
    this.logInfo('Duplicating project', { userId, id });
    await this.verifyOwnership(userId, id);
    return await projectRepository.duplicateProject(id, title);
  }

  // --- 2. Task Operations ---
  async createTask(userId: string, projectId: string, data: any) {
    this.logInfo('Creating task', { userId, projectId });
    await this.verifyOwnership(userId, projectId);
    
    const task = await projectRepository.createTask({
      ...data,
      projectId,
    });
    await this.recalculateProgress(projectId);
    return task;
  }

  async updateTask(userId: string, projectId: string, taskId: string, data: any) {
    this.logInfo('Updating task details', { userId, projectId, taskId });
    await this.verifyOwnership(userId, projectId);
    
    const task = await projectRepository.getTaskById(taskId);
    if (!task || task.projectId !== projectId) throw new NotFoundError('Task not found in this project');

    const completedAt = data.status === 'Done' ? new Date() : null;
    const updated = await projectRepository.updateTask(taskId, { ...data, completedAt });
    await this.recalculateProgress(projectId);
    return updated;
  }

  async deleteTask(userId: string, projectId: string, taskId: string) {
    this.logInfo('Deleting task', { userId, projectId, taskId });
    await this.verifyOwnership(userId, projectId);

    const task = await projectRepository.getTaskById(taskId);
    if (!task || task.projectId !== projectId) throw new NotFoundError('Task not found in this project');

    await projectRepository.deleteTask(taskId);
    await this.recalculateProgress(projectId);
    return { id: taskId };
  }

  // --- 3. Note Operations ---
  async createNote(userId: string, projectId: string, data: any) {
    this.logInfo('Creating project note', { userId, projectId });
    await this.verifyOwnership(userId, projectId);
    return await projectRepository.createNote({
      ...data,
      projectId,
    });
  }

  async updateNote(userId: string, projectId: string, noteId: string, data: any) {
    this.logInfo('Updating project note content', { userId, projectId, noteId });
    await this.verifyOwnership(userId, projectId);
    
    const note = await projectRepository.getNoteById(noteId);
    if (!note || note.projectId !== projectId) throw new NotFoundError('Note not found in this project');

    return await projectRepository.updateNote(noteId, data);
  }

  async deleteNote(userId: string, projectId: string, noteId: string) {
    this.logInfo('Deleting project note', { userId, projectId, noteId });
    await this.verifyOwnership(userId, projectId);

    const note = await projectRepository.getNoteById(noteId);
    if (!note || note.projectId !== projectId) throw new NotFoundError('Note not found in this project');

    return await projectRepository.deleteNote(noteId);
  }

  // --- 4. Resource Operations ---
  async createResource(userId: string, projectId: string, data: any) {
    this.logInfo('Creating project resource link', { userId, projectId });
    await this.verifyOwnership(userId, projectId);
    return await projectRepository.createResource({
      ...data,
      projectId,
    });
  }

  async deleteResource(userId: string, projectId: string, resourceId: string) {
    this.logInfo('Deleting project resource link', { userId, projectId, resourceId });
    await this.verifyOwnership(userId, projectId);

    const res = await projectRepository.getResourceById(resourceId);
    if (!res || res.projectId !== projectId) throw new NotFoundError('Resource not found in this project');

    return await projectRepository.deleteResource(resourceId);
  }

  // --- 5. Attachment Operations ---
  async createAttachment(userId: string, projectId: string, data: any) {
    this.logInfo('Saving project file attachment', { userId, projectId });
    await this.verifyOwnership(userId, projectId);
    return await projectRepository.createAttachment({
      ...data,
      projectId,
    });
  }

  async deleteAttachment(userId: string, projectId: string, attachmentId: string) {
    this.logInfo('Deleting project file attachment', { userId, projectId, attachmentId });
    await this.verifyOwnership(userId, projectId);

    const att = await projectRepository.getAttachmentById(attachmentId);
    if (!att || att.projectId !== projectId) throw new NotFoundError('Attachment not found in this project');

    return await projectRepository.deleteAttachment(attachmentId);
  }
}
export const projectService = new ProjectService();
