import { getUserProfile, updateUserProfile, deleteUser } from "../../controllers/users/index.js";
import express from "express";
import { authenticate } from "../../middleware/auth.js";
const router = express.Router();

router.get("/profile", authenticate, getUserProfile);
router.patch("/profile", authenticate, updateUserProfile);
router.delete("/profile", authenticate, deleteUser);

export default router;