import { resendProvider } from '../providers/resend.provider';
import { Logger } from '../../utils/logger';

interface QueueItem {
  id: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
  retries: number;
  maxRetries: number;
}

export class EmailQueue {
  private static instance: EmailQueue;
  private queue: QueueItem[] = [];
  private processing = false;
  private rateLimitDelayMs = 200; // Enforce max 5 emails per second

  private constructor() {}

  public static getInstance(): EmailQueue {
    if (!EmailQueue.instance) {
      EmailQueue.instance = new EmailQueue();
    }
    return EmailQueue.instance;
  }

  /**
   * Pushes a new email task into the background execution queue.
   */
  public push(to: string, subject: string, html: string, attachments?: Array<{ filename: string; content: Buffer }>) {
    const task: QueueItem = {
      id: Math.random().toString(),
      to,
      subject,
      html,
      attachments,
      retries: 0,
      maxRetries: 3,
    };
    this.queue.push(task);
    Logger.info('[EmailQueue] Task queued', { to, subject, taskId: task.id });
    
    // Trigger queue processor if not already running
    this.triggerProcessor();
  }

  private triggerProcessor() {
    if (this.processing) return;
    this.processing = true;
    
    // Execute loop asynchronously in background thread
    setImmediate(() => this.processNext());
  }

  private async processNext() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    const task = this.queue.shift()!;
    const startTime = Date.now();

    try {
      Logger.info('[EmailQueue] Processing item', { taskId: task.id, to: task.to });
      
      const response = await resendProvider.send({
        to: task.to,
        subject: task.subject,
        html: task.html,
        attachments: task.attachments,
      });

      const durationMs = Date.now() - startTime;
      Logger.info('[EmailQueue] Delivery success', {
        taskId: task.id,
        to: task.to,
        durationMs,
        responseId: response.id,
      });

    } catch (error: any) {
      task.retries += 1;
      const durationMs = Date.now() - startTime;

      Logger.error('[EmailQueue] Delivery failure', error, {
        taskId: task.id,
        to: task.to,
        attempt: task.retries,
        durationMs,
      });

      if (task.retries < task.maxRetries) {
        // Requeue for retry with backoff delay
        Logger.info('[EmailQueue] Re-queuing failed item', { taskId: task.id, nextAttempt: task.retries + 1 });
        this.queue.push(task);
      } else {
        Logger.error('[EmailQueue] Dead-letter threshold breached. Message dropped.', undefined, { taskId: task.id, to: task.to });
      }
    }

    // Rate limiting delay pause
    setTimeout(() => this.processNext(), this.rateLimitDelayMs);
  }

  public getStatus() {
    return {
      pendingTasks: this.queue.length,
      processing: this.processing,
    };
  }
}

export const emailQueue = EmailQueue.getInstance();
