import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Logs a notification to the console (and optionally sends email in the future).
 * Used for contact form submissions and order alerts.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  if (!isNonEmptyString(payload.title) || !isNonEmptyString(payload.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title and content are required.",
    });
  }

  console.log(`[Notification] ${payload.title}\n${payload.content}`);
  return true;
}
