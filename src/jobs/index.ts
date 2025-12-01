import cron from "node-cron";
import { db } from "../db/index.js";
import { reminders } from "../db/schema.js"; // You"ll need to create this table
import { eq, and, lte } from "drizzle-orm";
import { sendEmail } from "../services/email/index.js";

export const startReminderJob = () => {
  cron.schedule("* * * * *", async () => { // every minute
    console.log("Checking for due reminders...");
    
    const now = new Date();

    try {
      const dueReminders = await db.select().from(reminders).where(and(
        eq(reminders.status, "pending"),
        lte(reminders.dueDate, now)
      ));

      for (const reminder of dueReminders) {
        const sent = await sendEmail(
          reminder.userEmail,
          `Reminder: ${reminder.title}`,
          `<p>You asked me to remind you about: <strong>${reminder.description}</strong></p>`
        );

        if (sent) {
          await db.update(reminders)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(reminders.id, reminder.id));
        }
      }
    } catch (error) {
      console.error("Error processing reminders:", error);
    }
  });
};