import { getUserProfile, updateUserProfile, deleteUser } from "../../controllers/users/index.ts";
import express from "express";
import { authenticate } from "../../middleware/auth.ts";
const router = express.Router();

router.get("/profile", authenticate, getUserProfile);
router.patch("/profile", authenticate, updateUserProfile);
router.delete("/profile", authenticate, deleteUser);

export default router;