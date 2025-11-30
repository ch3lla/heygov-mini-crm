import authentication from "./authentication/index.ts";
import users from "./users/index.ts";
import contacts from "./contacts/index.ts";
import assistant from "./assistant/index.ts";
import express from "express";

const router = express.Router();

router.use("/auth", authentication);
router.use("/user", users);
router.use("/contacts", contacts);
router.use("/assistant", assistant);

export default router;