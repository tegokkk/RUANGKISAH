import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';

export function createMailer(config) {
  const transport =
    config.mailMode === 'smtp'
      ? nodemailer.createTransport({
          url: config.smtpUrl,
          requireTLS: config.production || config.vercel,
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        })
      : null;
  const outbox = resolve(config.dataDir, 'mail');
  if (!transport) mkdirSync(outbox, { recursive: true, mode: 0o700 });
  return async ({ to, subject, url, kind }) => {
    if (transport) {
      await transport.sendMail({
        from: config.mailFrom,
        to,
        subject,
        text:
          subject +
          '\n\nBuka tautan berikut untuk melanjutkan:\n' +
          url +
          '\n\nJika kamu tidak meminta tindakan ini, abaikan pesan ini.',
      });
    } else {
      // Local development only. Never exposed by an HTTP route or included in frontend assets.
      writeFileSync(
        resolve(outbox, Date.now() + '-' + randomUUID() + '.json'),
        JSON.stringify({
          to,
          subject,
          url,
          kind,
          createdAt: new Date().toISOString(),
        }),
        { mode: 0o600 },
      );
    }
  };
}
