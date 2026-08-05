import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { searchService } from '../services/search.service';
import { AuthenticationError, ValidationError } from '../errors/app-errors';

export class SearchController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public search = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const query = req.query.q as string || '';
    
    const results = await searchService.search(userId, query);
    return this.ok(res, results, 'Search results compiled successfully');
  };

  public getRecent = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const results = await searchService.getRecent(userId);
    return this.ok(res, results, 'Recent unique searches retrieved successfully');
  };

  public saveSearch = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { query } = req.body;

    if (query === undefined) {
      throw new ValidationError({}, 'Query string parameter is required');
    }

    const saved = await searchService.saveSearch(userId, query);
    return this.ok(res, saved, 'Search query saved to history log');
  };

  public listCommands = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const commands = await searchService.listCommands(userId);
    return this.ok(res, commands, 'Command palette registry compiled successfully');
  };

  public togglePin = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { commandId, isPinned } = req.body;

    if (!commandId || isPinned === undefined) {
      throw new ValidationError({}, 'commandId and isPinned parameters are required');
    }

    const toggled = await searchService.togglePin(userId, commandId, isPinned);
    return this.ok(res, toggled, 'Command pin state toggled successfully');
  };
}

export const searchController = new SearchController();
