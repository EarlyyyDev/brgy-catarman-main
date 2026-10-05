import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger.util";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    logger.warn("SMTP_USER/SMTP_PASSWORD not configured -- resident emails will be skipped");
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  return transporter;
}

/** Best-effort send -- a broken mail server must never fail the request
 * (e.g. a certificate submission) that triggered the notification. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getTransporter();
  if (!client) return;

  try {
    await client.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    logger.error("Failed to send resident email", { err, to, subject });
  }
}
