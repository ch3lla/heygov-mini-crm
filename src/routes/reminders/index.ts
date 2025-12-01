import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { createUserReminder, getUserReminder, getReminders, updateUserReminder, deleteUserReminder } from "../../controllers/reminders/index.js";

const router = Router();

router.post("/add", authenticate, createUserReminder);
router.get("/all", authenticate, getReminders);
router.get("/:reminderId", authenticate, getUserReminder);
router.patch("/:reminderId", authenticate, updateUserReminder);
router.delete("/:reminderId", authenticate, deleteUserReminder);

export default router;