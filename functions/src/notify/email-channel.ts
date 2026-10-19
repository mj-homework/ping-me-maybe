import { getAuth } from 'firebase-admin/auth';
import { defineString } from 'firebase-functions/params';
import { createTransport, Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { SOURCES } from '../sources/sources';
import { NotificationChannel, NotificationMessage } from './types';

// Defaults point at a local Mailpit. No credentials: Mailpit needs none, and a
// real SMTP account would come in as a secret, never as a hardcoded value.
const smtpHost = defineString('SMTP_HOST', { default: '127.0.0.1' });
const smtpPort = defineString('SMTP_PORT', { default: '1025' });
const mailFrom = defineString('MAIL_FROM', {
  default: 'Ping Me Maybe <alerts@ping-me-maybe.test>',
});

/** Short, so a stopped Mailpit turns into a `failed` delivery quickly. */
const SMTP_TIMEOUT_MS = 5_000;

const MESSAGE_ID_DOMAIN = 'ping-me-maybe.test';

const publishedFormat = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Budapest',
  dateStyle: 'short',
  timeStyle: 'short',
});

/** Sends over SMTP to the user's Auth email address (A10). */
export class EmailChannel implements NotificationChannel {
  readonly id = 'email';
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

  /**
   * @param {NotificationMessage} message What to send.
   * @return {Promise<void>} Resolves once the SMTP server accepted the mail.
   */
  async send(message: NotificationMessage): Promise<void> {
    const to = await recipient(message.userId);
    const { event, ruleName } = message;
    const sourceName = SOURCES.find((s) => s.id === event.sourceId)?.name ?? event.sourceId;
    const published = `${publishedFormat.format(event.publishedAt)} (Europe/Budapest)`;

    await this.getTransporter().sendMail({
      from: mailFrom.value(),
      to,
      // Same delivery, same Message-ID: a duplicate send is recognisable.
      messageId: `<${message.deliveryId}@${MESSAGE_ID_DOMAIN}>`,
      subject: `[${ruleName}] ${event.title}`,
      text: [
        event.title,
        '',
        `Source: ${sourceName}`,
        `Published: ${published}`,
        `Link: ${event.url}`,
        '',
        `You get this because your alert "${ruleName}" matched.`,
      ].join('\n'),
    });
  }

  /**
   * Created on first use: param values are only available at run time.
   * @return {Transporter} The SMTP transporter.
   */
  private getTransporter(): Transporter<SMTPTransport.SentMessageInfo> {
    if (!this.transporter) {
      const port = Number(smtpPort.value());
      if (!Number.isInteger(port) || port <= 0) {
        throw new Error(`SMTP_PORT "${smtpPort.value()}" is not a valid port`);
      }
      this.transporter = createTransport({
        host: smtpHost.value(),
        port,
        secure: false,
        connectionTimeout: SMTP_TIMEOUT_MS,
        greetingTimeout: SMTP_TIMEOUT_MS,
        socketTimeout: SMTP_TIMEOUT_MS,
      });
    }
    return this.transporter;
  }
}

/**
 * Looked up at send time and never stored in the delivery (design.md §1).
 * @param {string} userId Rule owner.
 * @return {Promise<string>} The user's email address.
 */
async function recipient(userId: string): Promise<string> {
  const user = await getAuth().getUser(userId);
  if (!user.email) throw new Error(`User ${userId} has no email address`);
  return user.email;
}
