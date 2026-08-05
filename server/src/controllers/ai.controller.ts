import { Request, Response } from 'express';
import { BaseController } from '../controllers/base.controller';
import { aiService } from '../ai/services/ai.service';
import { aiRepository } from '../repositories/ai.repository';
import { AuthenticationError, NotFoundError } from '../errors/app-errors';

export class AiController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public chat = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const { conversationId, message, assistant = 'Career Coach' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message parameter is required and must be a string.',
      });
    }

    let activeConvId = conversationId;

    // 1. Create conversation if not provided
    if (!activeConvId) {
      const title = message.length > 30 ? `${message.substring(0, 30)}...` : message;
      const conv = await aiRepository.createConversation(userId, assistant, title);
      activeConvId = conv.id;
    } else {
      // Verify ownership
      const conv = await aiRepository.getConversationById(activeConvId);
      if (!conv) throw new NotFoundError('Conversation not found');
      if (conv.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this conversation history.',
        });
      }
    }

    // 2. Call service
    const data = await aiService.chat(activeConvId, message);

    return this.ok(
      res,
      {
        conversationId: activeConvId,
        content: data.content,
        usage: data.usage,
      },
      'AI response compiled successfully'
    );
  };

  public listHistory = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await aiRepository.listConversations(userId);
    return this.ok(res, data, 'AI conversation history retrieved successfully');
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
}
export const aiController = new AiController();
