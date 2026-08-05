import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { projectService } from '../services/project.service';
import { AuthenticationError } from '../errors/app-errors';

export class ProjectController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  // --- 1. Project Controllers ---
  public listProjects = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await projectService.listProjects(userId);
    return this.ok(res, data, 'Projects list retrieved successfully');
  };

  public getProject = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await projectService.getProjectDetails(userId, req.params.id);
    return this.ok(res, data, 'Project details retrieved successfully');
  };

  public createProject = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await projectService.createProject(userId, req.body);
    return this.created(res, data, 'Project initialized successfully');
  };

  public updateProject = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await projectService.updateProject(userId, req.params.id, req.body);
    return this.ok(res, data, 'Project updated successfully');
  };

  public deleteProject = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await projectService.deleteProject(userId, req.params.id);
    return this.ok(res, null, 'Project deleted successfully');
  };

  public archiveProject = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await projectService.updateProject(userId, req.params.id, { status: 'Archived' });
    return this.ok(res, data, 'Project archived successfully');
  };

  public duplicateProject = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { title } = req.body;
    const data = await projectService.duplicateProject(userId, req.params.id, title);
    return this.created(res, data, 'Project duplicated successfully');
  };

  public getStats = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const stats = await projectService.getStats(userId);
    return this.ok(res, stats, 'Projects statistics calculated successfully');
  };

  // --- 2. Task Controllers ---
  public createTask = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = await projectService.createTask(userId, id, req.body);
    return this.created(res, data, 'Task created successfully');
  };

  public updateTask = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id, taskId } = req.params;
    const data = await projectService.updateTask(userId, id, taskId, req.body);
    return this.ok(res, data, 'Task updated successfully');
  };

  public deleteTask = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id, taskId } = req.params;
    const data = await projectService.deleteTask(userId, id, taskId);
    return this.ok(res, data, 'Task deleted successfully');
  };

  // --- 3. Note Controllers ---
  public createNote = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = await projectService.createNote(userId, id, req.body);
    return this.created(res, data, 'Note created successfully');
  };

  public updateNote = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id, noteId } = req.params;
    const data = await projectService.updateNote(userId, id, noteId, req.body);
    return this.ok(res, data, 'Note updated successfully');
  };

  public deleteNote = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id, noteId } = req.params;
    await projectService.deleteNote(userId, id, noteId);
    return this.ok(res, null, 'Note deleted successfully');
  };

  // --- 4. Resource Controllers ---
  public createResource = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = await projectService.createResource(userId, id, req.body);
    return this.created(res, data, 'Resource link saved successfully');
  };

  public deleteResource = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id, resourceId } = req.params;
    await projectService.deleteResource(userId, id, resourceId);
    return this.ok(res, null, 'Resource link deleted successfully');
  };

  // --- 5. Attachment Controllers ---
  public createAttachment = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = await projectService.createAttachment(userId, id, req.body);
    return this.created(res, data, 'File attachment logged successfully');
  };

  public deleteAttachment = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id, attachmentId } = req.params;
    await projectService.deleteAttachment(userId, id, attachmentId);
    return this.ok(res, null, 'File attachment deleted successfully');
  };
}
export const projectController = new ProjectController();
