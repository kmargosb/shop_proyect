import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: {
    filename: string;
    content: Buffer;
  }[]
) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to,
      subject,
      html,
      attachments,
    });

    console.log("📨 RESEND RESPONSE:", response);
  } catch (error) {
    console.error("❌ RESEND ERROR:", error);
  }
}