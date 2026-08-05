import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { interviewService } from '../services/interview.service';
import { AuthenticationError } from '../errors/app-errors';

export class InterviewController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public listQuestions = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await interviewService.listQuestions(userId);
    return this.ok(res, data, 'Interview questions retrieved successfully');
  };

  public toggleQuestionState = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { questionId, bookmarked, solved } = req.body;
    const data = await interviewService.toggleQuestionState(userId, questionId, { bookmarked, solved });
    return this.ok(res, data, 'Question state toggled successfully');
  };

  public listSessions = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await interviewService.listSessions(userId);
    return this.ok(res, data, 'Interview history retrieved successfully');
  };

  public createSession = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await interviewService.createSession(userId, req.body);
    return this.created(res, data, 'Mock interview session logged successfully');
  };

  public updateSession = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = await interviewService.updateSession(userId, id, req.body);
    return this.ok(res, data, 'Interview session updated successfully');
  };

  public deleteSession = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    await interviewService.deleteSession(userId, id);
    return this.ok(res, null, 'Interview session removed successfully');
  };

  public getStatistics = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await interviewService.getStatistics(userId);
    return this.ok(res, data, 'Interview preparation statistics compiled successfully');
  };
}
export const interviewController = new InterviewController();
