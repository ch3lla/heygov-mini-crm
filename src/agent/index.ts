import "dotenv/config";
import { Anthropic } from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompts/index.js";
import { crmTools } from "./tools/index.js"
import type { IAgentResponse } from "../types/index.js"
import { getConversationHistory, addToConversationHistory } from "./store/index.js";
import { executeCRMTool } from "./executor/index.js";

export const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export async function runAgent(userId: number, query: string) {
    const conversationHistory = sanitizeHistory(getConversationHistory(userId));
    const currentMessages: Anthropic.MessageParam[] = [
        ...conversationHistory,
        { role: "user", content: query }
    ];
    addToConversationHistory(userId, { role: "user", content: query });

    // Start of the Turn Loop: The turn loop is the number of times the agent can call a tool or number of tool
    let finalResponseText = "";
    let toolResultsSummary: any[] = [];
    let iteration = 0;
    const MAX_ITERATIONS = 5;

    while (iteration < MAX_ITERATIONS) {
        iteration++;

        const response = await claude.messages.create({
            model: "claude-haiku-4-5", // going with this for a quick test on the use case + its fast
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: crmTools as any,
            messages: currentMessages
        });
        
        const assistantMessage: Anthropic.MessageParam = {
            role: "assistant",
            content: response.content
        };
        currentMessages.push(assistantMessage);
        addToConversationHistory(userId, assistantMessage);

        // console.log("res: ", response)

        if (response.stop_reason !== "tool_use") { // break out of the loop here if llm is not calling a tool
            const textBlock = response.content.find(b => b.type === "text");
            finalResponseText = textBlock?.text || "";
            break;
        }

        // execute tool
        const toolUseBlocks = response.content.filter(b => b.type === "tool_use");
        const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
            console.log(`[Agent] Executing tool: ${block.name}`);
            const result = await executeCRMTool(userId, block.name, block.input);

            toolResultsSummary.push({ tool: block.name, input: block.input, result }); // tracked for debugging
            toolResultBlocks.push({
                type: "tool_result",
                tool_use_id: block.id, // Link result to the specific tool call ID
                content: JSON.stringify(result)
            });
        }

        const toolResultMessage: Anthropic.MessageParam = {
            role: "user", // in claude sdk tool responses are assigned to user role
            content: toolResultBlocks
        };
        currentMessages.push(toolResultMessage);
        // console.log(currentMessages)
        addToConversationHistory(userId, toolResultMessage);
    }
    
    return {
        message: finalResponseText,
        toolResults: toolResultsSummary
    };
}

// helper function to prevent hanging tool_use in history
function sanitizeHistory(history: Anthropic.MessageParam[]): Anthropic.MessageParam[] {
    if (history.length === 0) {
        return history;
    }
    const lastMsg = history[history.length - 1];
    
    // Check if it is from assistant
    if (lastMsg?.role === "assistant" && Array.isArray(lastMsg?.content)) {
        const hasToolUse = lastMsg.content.some((block: any) => block.type === "tool_use");
        
        if (hasToolUse) {
            console.warn("[Sanitizer] Removing corrupted dangling tool_use from history.");
            return history.slice(0, -1);
        }
    }
    return history
}