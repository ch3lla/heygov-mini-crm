
import express from "express";
import { authenticate } from "../../middleware/auth.js";
import type { IRequest } from "../../types/index.js";
import type { Response } from "express";
import { addClients } from "../../utils/events.js";
const router = express.Router();

router.get('/events', authenticate, (req: IRequest, res: Response) => {
    const userId = req.userId;
    
    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    addClients(Number(userId), res);
});

export default router;