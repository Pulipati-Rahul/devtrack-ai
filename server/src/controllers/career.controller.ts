import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { careerService } from '../services/career.service';
import { aiRepository } from '../repositories/ai.repository';
import { AuthenticationError, NotFoundError } from '../errors/app-errors';

export class CareerController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  // --- Conversations & Chat ---
  public chat = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { conversationId, message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message parameter is required and must be a string.',
      });
    }

    let activeConvId = conversationId;

    if (!activeConvId) {
      const title = message.length > 30 ? `${message.substring(0, 30)}...` : message;
      const conv = await aiRepository.createConversation(userId, 'Career Coach', title);
      activeConvId = conv.id;
    } else {
      const conv = await aiRepository.getConversationById(activeConvId);
      if (!conv) throw new NotFoundError('Conversation not found');
      if (conv.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this conversation history.',
        });
      }
    }

    const data = await careerService.chat(userId, activeConvId, message);

    return this.ok(
      res,
      {
        conversationId: activeConvId,
        content: data.content,
        usage: data.usage,
      },
      'Coach response compiled successfully'
    );
  };

  public listHistory = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const conversations = await aiRepository.listConversations(userId);
    const history = conversations.filter((c) => c.assistant === 'Career Coach');
    return this.ok(res, history, 'AI Career Coach conversation history retrieved successfully');
  };

  public deleteHistory = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;

    const conv = await aiRepository.getConversationById(id);
    if (!conv) throw new NotFoundError('Conversation not found');
    if (conv.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this conversation.',
      });
    }

    await aiRepository.deleteConversation(id);
    return this.ok(res, null, 'AI conversation deleted successfully');
  };

  // --- SWOT Audit Report ---
  public analyze = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await careerService.analyze(userId);
    return this.ok(res, data, 'Career profile analysis completed successfully');
  };

  // --- Goal Management ---
  public listGoals = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const goals = await careerService.listGoals(userId);
    return this.ok(res, goals, 'Career goals retrieved successfully');
  };

  public createGoal = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const goal = await careerService.createGoal(userId, req.body);
    return this.created(res, goal, 'Goal created successfully');
  };

  public updateGoal = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const goal = await careerService.updateGoal(userId, id, req.body);
    return this.ok(res, goal, 'Goal updated successfully');
  };

  public deleteGoal = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    await careerService.deleteGoal(userId, id);
    return this.ok(res, null, 'Goal deleted successfully');
  };

  // --- Roadmaps ---
  public getRoadmap = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const roadmap = await careerService.getRoadmap(userId);
    return this.ok(res, roadmap, 'Career roadmap retrieved successfully');
  };

  public generateRoadmap = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const roadmap = await careerService.generateRoadmap(userId);
    return this.ok(res, roadmap, 'Roadmap generated successfully');
  };

  // --- Recommendations ---
  public listRecommendations = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const recs = await careerService.listRecommendations(userId);
    return this.ok(res, recs, 'Career recommendations retrieved successfully');
  };

  public generateRecommendations = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const recs = await careerService.generateRecommendations(userId);
    return this.ok(res, recs, 'Recommendations generated successfully');
  };

  public toggleRecommendation = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const { completed } = req.body;
    const rec = await careerService.toggleRecommendation(userId, id, completed);
    return this.ok(res, rec, 'Recommendation completion status updated');
  };
}
export const careerController = new CareerController();
