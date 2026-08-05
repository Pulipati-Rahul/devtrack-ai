import { Request, Response } from 'express';
import { BaseController } from '../../controllers/base.controller';
import { emailService } from '../services/email.service';
import { emailQueue } from '../queue/email.queue';
import { ValidationError } from '../../errors/app-errors';

export class EmailController extends BaseController {
  public send = async (req: Request, res: Response) => {
    const { to, name, subject, message } = req.body;

    if (!to || !name || !subject || !message) {
      throw new ValidationError({}, 'Missing parameters in email send payload.');
    }

    // Build responsive HTML general template on-the-fly and queue
    await emailService.sendWelcome(to, name);
    return this.ok(res, null, 'Transactional test email queued successfully');
  };

  public test = async (req: Request, res: Response) => {
    const userSession = req.session;
    if (!userSession) {
      throw new ValidationError({}, 'Session unauthorized.');
    }

    const { email, name } = userSession.user;
    await emailService.sendWelcome(email, name);

    return this.ok(res, null, `Test welcome email queued successfully to: ${email}`);
  };

  public status = async (req: Request, res: Response) => {
    const statusInfo = emailQueue.getStatus();
    return this.ok(res, statusInfo, 'Email queue status retrieved successfully');
  };
}
export const emailController = new EmailController();
