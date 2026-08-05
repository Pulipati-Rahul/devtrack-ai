import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BaseService } from '../../services/base.service';
import { emailQueue } from '../queue/email.queue';
import { settingsRepository } from '../../repositories/settings.repository';
import * as Templates from '../templates/templates';

export class EmailService extends BaseService {
  constructor() {
    super('EmailService');
  }

  /**
   * Helper to check settings preferences before queuing notifications.
   */
  private async shouldSend(userId: string, notificationKey: string): Promise<boolean> {
    try {
      const settings = await settingsRepository.getSettings(userId);
      if (!settings || !settings.notifications) return true; // Default send

      const pref = (settings.notifications as any)[notificationKey];
      return pref !== false;
    } catch (err) {
      this.logError('Error checking email preferences settings, defaulting to send', err);
      return true;
    }
  }

  /**
   * 1. Send Welcome Email
   */
  public async sendWelcome(to: string, name: string) {
    this.logInfo('Queuing Welcome Email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.WelcomeEmail, { name }));
    emailQueue.push(to, 'Welcome to DevTrack AI!', html);
  }

  /**
   * 2. Send Email Verification URL
   */
  public async sendVerification(to: string, name: string, url: string) {
    this.logInfo('Queuing Verification Email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.EmailVerification, { name, url }));
    emailQueue.push(to, 'Verify Your Email Address', html);
  }

  /**
   * 3. Send Password Reset URL
   */
  public async sendPasswordReset(to: string, name: string, url: string) {
    this.logInfo('Queuing Password Reset Email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.PasswordReset, { name, url }));
    emailQueue.push(to, 'Reset Your Password', html);
  }

  /**
   * 4. Send Password Changed Alert
   */
  public async sendPasswordChanged(userId: string, to: string, name: string) {
    const isEnabled = await this.shouldSend(userId, 'securityAlerts');
    if (!isEnabled) {
      this.logInfo('Email bypassed due to securityAlerts settings configuration', { userId });
      return;
    }

    this.logInfo('Queuing Password Changed Email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.PasswordChanged, { name }));
    emailQueue.push(to, 'Your Password Was Changed', html);
  }

  /**
   * 5. Send Account Deleted Confirmation
   */
  public async sendAccountDeleted(to: string, name: string) {
    this.logInfo('Queuing Account Deleted Email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.AccountDeleted, { name }));
    emailQueue.push(to, 'Your Account Was Deleted', html);
  }

  /**
   * 6. Send Resume Ready Alert
   */
  public async sendResumeReady(userId: string, to: string, name: string, resumeTitle: string) {
    const isEnabled = await this.shouldSend(userId, 'resumeAlerts');
    if (!isEnabled) {
      this.logInfo('Email bypassed due to resumeAlerts settings configuration', { userId });
      return;
    }

    this.logInfo('Queuing Resume Export Email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.ResumeExportReady, { name, resumeTitle }));
    emailQueue.push(to, 'Your Resume Export is Ready', html);
  }

  /**
   * 7. Send ATS Report Ready Notification
   */
  public async sendAtsReportReady(userId: string, to: string, name: string, score: number) {
    const isEnabled = await this.shouldSend(userId, 'resumeAlerts');
    if (!isEnabled) {
      this.logInfo('Email bypassed due to resumeAlerts settings configuration', { userId });
      return;
    }

    this.logInfo('Queuing ATS scan alert email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.AtsReportReady, { name, score }));
    emailQueue.push(to, 'Your ATS Audit Report is Ready', html);
  }

  /**
   * 8. Send Portfolio Published Alert
   */
  public async sendPortfolioPublished(userId: string, to: string, name: string, url: string) {
    const isEnabled = await this.shouldSend(userId, 'portfolioAlerts');
    if (!isEnabled) {
      this.logInfo('Email bypassed due to portfolioAlerts settings configuration', { userId });
      return;
    }

    this.logInfo('Queuing Portfolio Published Email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.PortfolioPublished, { name, url }));
    emailQueue.push(to, 'Your Developer Portfolio is Live!', html);
  }

  /**
   * 9. Send DSA streak reminders
   */
  public async sendDsaReminder(userId: string, to: string, name: string) {
    const isEnabled = await this.shouldSend(userId, 'dsaReminders');
    if (!isEnabled) {
      this.logInfo('Email bypassed due to dsaReminders settings configuration', { userId });
      return;
    }

    this.logInfo('Queuing DSA practice reminder email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.GeneralNotification, { name, message: 'Keep your DSA streak alive! Solve your daily algorithm coding challenges.' }));
    emailQueue.push(to, 'Solve Your Daily DSA coding task', html);
  }

  /**
   * 10. Send Interview Prep alerts
   */
  public async sendInterviewReminder(userId: string, to: string, name: string) {
    const isEnabled = await this.shouldSend(userId, 'interviewReminders');
    if (!isEnabled) {
      this.logInfo('Email bypassed due to interviewReminders settings configuration', { userId });
      return;
    }

    this.logInfo('Queuing Interview Prep reminder email', { to });
    const html = renderToStaticMarkup(React.createElement(Templates.GeneralNotification, { name, message: 'Prepare for success! Practice your mock coding interview questions.' }));
    emailQueue.push(to, 'Practice Your Mock Interview prep tasks', html);
  }
}

export const emailService = new EmailService();
