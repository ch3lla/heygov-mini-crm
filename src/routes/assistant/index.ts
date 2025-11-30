import { Router } from "express";
import { authenticate } from "../../middleware/auth.ts";
import { assistantHandler } from "../../controllers/assistant/index.ts";

const router = Router();

router.post("/query", authenticate, assistantHandler);

export default router;
