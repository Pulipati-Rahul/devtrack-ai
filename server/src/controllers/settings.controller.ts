import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { settingsService } from '../services/settings.service';
import { AuthenticationError } from '../errors/app-errors';

export class SettingsController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public getSettings = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await settingsService.getSettings(userId);
    return this.ok(res, data, 'User settings retrieved successfully');
  };

  public updateSettings = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { name, image, ...preferences } = req.body;

    // 1. If display name or image is provided, update account profile details
    if (name || image) {
      await settingsService.updateAccountProfile(userId, { name, image });
    }

    // 2. Save settings preferences
    const data = await settingsService.updateSettings(userId, preferences);
    return this.ok(res, data, 'User settings updated successfully');
  };

  public getSessions = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await settingsService.getSessions(userId);
    return this.ok(res, data, 'Active device sessions retrieved successfully');
  };

  public deleteSession = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;

    await settingsService.deleteSession(userId, id);
    return this.ok(res, null, 'Active device session terminated successfully');
  };

  public deleteRequest = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    
    // Execute account deletion (confirmation cascading teardown)
    await settingsService.deleteAccount(userId);

    return this.ok(res, null, 'Account deletion executed successfully');
  };

  public exportUserData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await settingsService.exportUserData(userId);
    return this.ok(res, data, 'User preferences footprint dataset compiled successfully');
  };

  public deleteUserData = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { target } = req.body; // 'ai' | 'analytics' | 'all'
    const data = await settingsService.deleteUserData(userId, target || 'all');
    return this.ok(res, data, 'User preferences targets data wiped successfully');
  };
}
export const settingsController = new SettingsController();
