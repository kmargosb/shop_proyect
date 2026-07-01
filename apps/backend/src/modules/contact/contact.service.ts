import { sendEmail } from '@/modules/email/email.service';
import { contactMessageTemplate } from '@/modules/email/email.templates';
import type { ContactInput } from './contact.schema';

export async function sendContactMessage(data: ContactInput) {
  // Honeypot
  if (data.website) {
    return;
  }

  await sendEmail({
    to: process.env.CONTACT_EMAIL || process.env.SUPPORT_EMAIL!,
    subject: `[Contact] ${data.subject}`,
    html: contactMessageTemplate(data.name, data.email, data.subject, data.message),
  });
}
