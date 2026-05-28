export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  // TODO: Implement real email sending via SendGrid/Resend when API key is provided
  console.log("==================================================");
  console.log(`[MOCK EMAIL] TO: ${to}`);
  console.log(`[MOCK EMAIL] SUBJECT: ${subject}`);
  console.log(`[MOCK EMAIL] BODY:\n${text}`);
  console.log("==================================================");
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}
