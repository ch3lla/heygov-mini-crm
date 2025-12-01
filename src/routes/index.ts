import authentication from "./authentication/index.js";
import users from "./users/index.js";
import contacts from "./contacts/index.js";
import assistant from "./assistant/index.js";
import reminders from "./reminders/index.js";
import express from "express";

const router = express.Router();

router.use("/auth", authentication);
router.use("/user", users);
router.use("/contacts", contacts);
router.use("/assistant", assistant);
router.use("/reminder", reminders);

export default router;