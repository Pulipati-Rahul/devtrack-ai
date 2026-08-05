import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { resumeService } from '../services/resume.service';
import { AuthenticationError } from '../errors/app-errors';

export class ResumeController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public listResumes = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const list = await resumeService.listResumes(userId);
    return this.ok(res, list, 'Resumes list retrieved successfully');
  };

  public getResume = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await resumeService.getResume(userId, req.params.id);
    return this.ok(res, data, 'Resume details retrieved successfully');
  };

  public createResume = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { name, template } = req.body;
    const data = await resumeService.createResume(userId, name, template);
    return this.created(res, data, 'Resume initialized successfully');
  };

  public updateResume = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await resumeService.updateResume(userId, req.params.id, req.body);
    return this.ok(res, data, 'Resume theme parameters updated successfully');
  };

  public updateResumeSection = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { sectionId } = req.params;
    const data = await resumeService.updateResumeSection(userId, req.params.id, sectionId, req.body);
    return this.ok(res, data, 'Resume section updated successfully');
  };

  public deleteResume = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await resumeService.deleteResume(userId, req.params.id);
    return this.ok(res, null, 'Resume deleted successfully');
  };

  public duplicateResume = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { name } = req.body;
    const data = await resumeService.duplicateResume(userId, req.params.id, name);
    return this.created(res, data, 'Resume duplicated successfully');
  };

  public importProfile = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { sections } = req.body;
    const data = await resumeService.importProfile(userId, req.params.id, sections);
    return this.ok(res, data, 'Profile coordinates auto-filled successfully');
  };

  public exportResume = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const id = req.params.id;
    // Log the last exported timestamp in the database
    const updated = await resumeService.updateResume(userId, id, {
      lastExported: new Date(),
    });
    return this.ok(res, updated, 'Resume marked as exported successfully');
  };
}
export const resumeController = new ResumeController();
