import nodemailer from 'nodemailer';
import type Transporter from 'nodemailer/lib/smtp-transport/index.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let transporter: nodemailer.Transporter | null = null;

export function getEmailTransporter(): nodemailer.Transporter | null {
  if (!config.email.host || !config.email.user) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port ?? 587,
      auth: { user: config.email.user, pass: config.email.pass },
    } as Transporter.Options);
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const t = getEmailTransporter();
  if (!t) {
    logger.warn('Email yapılandırması yok, mail gönderilmedi', { to, subject });
    return;
  }
  await t.sendMail({
    from: config.email.from ?? 'QuizArena <no-reply@quizarena.app>',
    to,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h1 style="color:#7C3AED;">QuizArena — Şifre Sıfırlama</h1>
      <p>Şifrenizi sıfırlamak için bir istekte bulundunuz. Aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${resetUrl}" style="display:inline-block; background:#7C3AED; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none;">Şifreyi Sıfırla</a></p>
      <p style="color:#94A3B8; font-size:13px;">Bu bağlantı 1 saat geçerlidir. İstek size ait değilse bu e-postayı yok sayın.</p>
    </div>
  `;
  const t = getEmailTransporter();
  if (!t) {
    logger.info('DEV MODE — Password reset URL', { to, resetUrl });
    return;
  }
  await sendEmail(to, 'QuizArena — Şifre Sıfırlama', html);
}
