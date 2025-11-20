import { logger } from '../utils/logger.js';
import {
  mentionDetectedTemplate,
  mentionLostTemplate,
  competitorMentionedTemplate,
  weeklyDigestTemplate,
} from '../templates/index.js';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  async sendEmail(params: EmailParams): Promise<void> {
    // In production, integrate with SendGrid, AWS SES, or similar
    // For now, just log the email
    logger.info({
      to: params.to,
      subject: params.subject,
    }, 'Email would be sent (not configured)');

    // Example SendGrid integration:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: params.to,
      from: 'alerts@mentiontracker.dev',
      subject: params.subject,
      html: params.html,
    });
    */

    // TODO: Uncomment and configure when ready for production
    // For development, you can also write emails to disk for testing:
    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_DEBUG === 'true') {
      const fs = await import('fs/promises');
      const path = await import('path');
      const emailDir = path.join(process.cwd(), 'emails');

      try {
        await fs.mkdir(emailDir, { recursive: true });
        const filename = `email-${Date.now()}-${params.to.replace(/[^a-z0-9]/gi, '_')}.html`;
        await fs.writeFile(path.join(emailDir, filename), params.html);
        logger.debug({ filename }, 'Email saved to disk');
      } catch (error: any) {
        logger.warn({ error: error.message }, 'Could not save email to disk');
      }
    }
  }

  generateMentionDetectedEmail(data: any): string {
    return mentionDetectedTemplate(data);
  }

  generateMentionLostEmail(data: any): string {
    return mentionLostTemplate(data);
  }

  generateCompetitorMentionedEmail(data: any): string {
    return competitorMentionedTemplate(data);
  }

  generateWeeklyDigestEmail(data: any): string {
    return weeklyDigestTemplate(data);
  }
}

export const emailService = new EmailService();
