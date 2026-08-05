import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { analyticsService } from '../services/analytics.service';
import { AuthenticationError } from '../errors/app-errors';

export class AnalyticsController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public getDashboardData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await analyticsService.getDashboardData(userId);
    return this.ok(res, data, 'Dashboard overview dataset retrieved successfully');
  };

  public getProjectsData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await analyticsService.getProjectsData(userId);
    return this.ok(res, data, 'Projects analytics dataset retrieved successfully');
  };

  public getResumeData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await analyticsService.getResumeData(userId);
    return this.ok(res, data, 'Resume analytics dataset retrieved successfully');
  };

  public getDsaData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await analyticsService.getDsaData(userId);
    return this.ok(res, data, 'DSA analytics dataset retrieved successfully');
  };

  public getInterviewData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await analyticsService.getInterviewData(userId);
    return this.ok(res, data, 'Interview analytics dataset retrieved successfully');
  };

  public saveSnapshot = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { snapshotType } = req.body;
    const data = await analyticsService.saveSnapshot(userId, snapshotType || 'daily');
    return this.ok(res, data, 'Analytics snapshot saved successfully');
  };

  public listSnapshots = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { snapshotType } = req.query;
    const data = await analyticsService.listSnapshots(userId, snapshotType ? String(snapshotType) : undefined);
    return this.ok(res, data, 'Snapshots listed successfully');
  };

  public generateReport = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { reportType } = req.body;
    const data = await analyticsService.generateReport(userId, reportType || 'career');
    return this.ok(res, data, 'Analytics report generated using AI successfully');
  };

  public listReports = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { reportType } = req.query;
    const data = await analyticsService.listReports(userId, reportType ? String(reportType) : undefined);
    return this.ok(res, data, 'Reports listed successfully');
  };

  public getTimelineData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await analyticsService.getTimelineData(userId);
    return this.ok(res, data, 'Timeline activities logs retrieved successfully');
  };
}
export const analyticsController = new AnalyticsController();
