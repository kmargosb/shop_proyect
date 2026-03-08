import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailAttachment = {
  filename: string
  content: Buffer
}

type SendEmailOptions = {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments
}: SendEmailOptions) {

  try {

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to,
      subject,
      html,
      attachments
    })

    console.log("📨 Email sent:", response.data?.id)

    return response

  } catch (error) {

    console.error("❌ Email send error:", error)

    throw new Error("Email delivery failed")

  }

}