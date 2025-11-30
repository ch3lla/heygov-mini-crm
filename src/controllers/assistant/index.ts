import { runAgent } from "../../agent/index.ts";
import type { Response } from "express";
import type { IRequest } from "../../types/index.ts";

const assistantHandler = async (req: IRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const { query } = req.body;
    
    if (!userId) {
        res.status(401).json({
            status: 'Error',
            message: 'User not authenticated',
        });
        return;
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
            status: 'Error',
            message: 'Query is required and must be a non-empty string',
        });
        return;
    }

    try {
        const result = await runAgent(userId, query);
        res.status(200).json({
            status: 'Success',
            data: {
                message: cleanAndParseAgentResponse(result.message),
                toolsUsed: result.toolResults
            }
        });
    } catch (error: any) {
        console.error('Assistant error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message || 'Something went wrong with the assistant',
        });
    }
};


/**
 * Cleans LLM output by removing Markdown code blocks and parsing JSON.
 */
export const cleanAndParseAgentResponse = (response: string): any => {
    if (!response) {
        return null;
    }

    const firstOpen = response.indexOf('{');
    const lastClose = response.lastIndexOf('}');
    if (firstOpen === -1 || lastClose === -1 || firstOpen >= lastClose) {
        console.error("No JSON brackets found in response");
        return response;
    }

    const cleaned = response.substring(firstOpen, lastClose + 1);
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("JSON parse error:", err);
        return null;
    }
};


export { assistantHandler }