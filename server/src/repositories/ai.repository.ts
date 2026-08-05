import { db } from '../db/database';
import { eq, asc, desc } from 'drizzle-orm';
import { aiConversation, aiMessage } from '../db/schema';

export class AiRepository {
  async createConversation(userId: string, assistant: string, title: string) {
    const [result] = await db
      .insert(aiConversation)
      .values({
        userId,
        assistant,
        title,
      })
      .returning();
    return result;
  }

  async listConversations(userId: string) {
    return await db
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.userId, userId))
      .orderBy(desc(aiConversation.createdAt));
  }

  async getConversationById(id: string) {
    const [result] = await db
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.id, id))
      .limit(1);
    return result || null;
  }

  async deleteConversation(id: string) {
    const [result] = await db
      .delete(aiConversation)
      .where(eq(aiConversation.id, id))
      .returning();
    return result;
  }

  async getMessages(conversationId: string) {
    return await db
      .select()
      .from(aiMessage)
      .where(eq(aiMessage.conversationId, conversationId))
      .orderBy(asc(aiMessage.createdAt));
  }

  async createMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ) {
    const [result] = await db
      .insert(aiMessage)
      .values({
        conversationId,
        role,
        content,
        metadata: metadata || null,
      })
      .returning();
    return result;
  }

  async trimConversationContext(conversationId: string, maxMessagesCount: number = 20) {
    // Get all messages ordered descending
    const messages = await db
      .select()
      .from(aiMessage)
      .where(eq(aiMessage.conversationId, conversationId))
      .orderBy(desc(aiMessage.createdAt));

    if (messages.length > maxMessagesCount) {
      // Find the messages to keep (the last N messages)
      const toDelete = messages.slice(maxMessagesCount);
      const deleteIds = toDelete.map((m) => m.id);

      // Deletes old messages to keep context window optimized
      for (const id of deleteIds) {
        await db.delete(aiMessage).where(eq(aiMessage.id, id));
      }
    }
  }
}
export const aiRepository = new AiRepository();
