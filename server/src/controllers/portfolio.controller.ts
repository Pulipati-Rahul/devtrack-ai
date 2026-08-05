import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { portfolioService } from '../services/portfolio.service';
import { AuthenticationError } from '../errors/app-errors';

export class PortfolioController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public getPortfolio = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await portfolioService.getPortfolio(userId);
    return this.ok(res, data, 'Portfolio configuration retrieved successfully');
  };

  public savePortfolio = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await portfolioService.savePortfolio(userId, req.body);
    return this.created(res, data, 'Portfolio configuration created successfully');
  };

  public updatePortfolio = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await portfolioService.savePortfolio(userId, req.body);
    return this.ok(res, data, 'Portfolio configuration updated successfully');
  };

  public deletePortfolio = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await portfolioService.deletePortfolio(userId);
    return this.ok(res, null, 'Portfolio deleted successfully');
  };

  public publish = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await portfolioService.setPublishStatus(userId, true);
    return this.ok(res, data, 'Portfolio published successfully');
  };

  public unpublish = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await portfolioService.setPublishStatus(userId, false);
    return this.ok(res, data, 'Portfolio unpublished successfully');
  };

  public importProfile = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await portfolioService.importProfileData(userId);
    return this.ok(res, data, 'Profile parameters loaded for import merging');
  };

  public getPublicPortfolio = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const data = await portfolioService.getPublicPortfolio(slug);
    return this.ok(res, data, 'Public portfolio data retrieved successfully');
  };
}
export const portfolioController = new PortfolioController();
