import { Resend } from "resend";

// We'll use the API key from environment variables, or fallback to the provided one if env isn't set yet
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_dPneokqt_6xkVHsx2sPMSZavqSFNr7Uxc";
const resend = new Resend(RESEND_API_KEY);

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Mr. Todd's Workshop <hello@mrtoddsworkshop.com>",
      to: [to],
      subject: subject,
      text: text,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}
