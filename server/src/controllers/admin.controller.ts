import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { adminService } from '../services/admin.service';

export class AdminController extends BaseController {
  public getDashboard = async (req: Request, res: Response) => {
    const data = await adminService.getDashboard();
    return this.ok(res, data, 'Administrative metrics loaded successfully');
  };

  public getUsers = async (req: Request, res: Response) => {
    const search = (req.query.search as string) || '';
    const role = (req.query.role as string) || undefined;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const data = await adminService.getUsers(search, role, limit, offset);
    return this.ok(res, data, 'Users list loaded successfully');
  };

  public getUserDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await adminService.getUserDetails(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User account details not found',
      });
    }
    return this.ok(res, data, 'User details loaded successfully');
  };

  public updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, name } = req.body;

    const data = await adminService.updateUser(id, { role, name });
    return this.ok(res, data, 'User updated successfully');
  };

  public deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    await adminService.deleteUser(id);
    return this.ok(res, null, 'User purged successfully');
  };

  public getSystemMetrics = async (req: Request, res: Response) => {
    const data = await adminService.getSystemMetrics();
    return this.ok(res, data, 'System health checks loaded successfully');
  };

  public getActivityLogs = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const data = await adminService.getActivityLogs(limit, offset);
    return this.ok(res, data, 'Activity logs list loaded successfully');
  };

  public getAnalytics = async (req: Request, res: Response) => {
    const data = await adminService.getAnalyticsData();
    return this.ok(res, data, 'Administrative module analytics loaded successfully');
  };
}
export const adminController = new AdminController();
