import { Router } from "express";
import { authenticate } from "../../middleware/auth.ts";
import * as reminderController from "../../controllers/reminders/index.ts";

const router = Router();

router.post("/add", authenticate, reminderController.createReminder);
router.get("/all", authenticate, reminderController.getReminders);
router.get("/:reminderId", authenticate, reminderController.getReminder);
router.patch("/:reminderId", authenticate, reminderController.updateReminder);
router.delete("/:reminderId", authenticate, reminderController.deleteReminder);

export default router;