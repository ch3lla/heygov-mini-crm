import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { assistantHandler } from "../../controllers/assistant/index.js";

const router = Router();

router.post("/query", authenticate, assistantHandler);

export default router;
