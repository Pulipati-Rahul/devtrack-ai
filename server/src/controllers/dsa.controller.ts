import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { dsaService } from '../services/dsa.service';
import { AuthenticationError } from '../errors/app-errors';

export class DsaController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public listProblems = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await dsaService.listProblems(userId);
    return this.ok(res, data, 'DSA solved problems retrieved successfully');
  };

  public createProblem = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await dsaService.createProblem(userId, req.body);
    return this.created(res, data, 'Solved problem logged successfully');
  };

  public updateProblem = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = await dsaService.updateProblem(userId, id, req.body);
    return this.ok(res, data, 'Problem details updated successfully');
  };

  public deleteProblem = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    await dsaService.deleteProblem(userId, id);
    return this.ok(res, null, 'Problem record deleted successfully');
  };

  public getRevisions = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await dsaService.getUpcomingRevisions(userId);
    return this.ok(res, data, 'Revision schedule retrieved successfully');
  };

  public completeRevision = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = await dsaService.completeRevision(userId, id);
    return this.ok(res, data, 'Spaced revision schedule updated successfully');
  };

  public getStatistics = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await dsaService.getStatistics(userId);
    return this.ok(res, data, 'DSA statistics and streaks compiled successfully');
  };
}
export const dsaController = new DsaController();
