import "dotenv/config";
import { Anthropic } from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompts/index.ts";
import { crmTools } from "./tools/index.ts"
import type { IAgentResponse } from "../types/index.ts"
import { getConversationHistory, addToConversationHistory } from "./store/index.ts";
import { executeCRMTool } from "./executor/index.ts";

export const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export async function runAgent(userId: number, query: string) {
    const conversationHistory = getConversationHistory(userId);
    const currentMessages: Anthropic.MessageParam[] = [
        ...conversationHistory,
        { role: "user", content: query }
    ];

    // Start of the Turn Loop: The turn loop is the number of times the agent can call a tool or number of tool
    let finalResponseText = "";
    let toolResultsSummary: any[] = [];
    let iteration = 0;
    const MAX_ITERATIONS = 5;

    while (iteration < MAX_ITERATIONS) {
        iteration++;

        const response = await claude.messages.create({
            model: "claude-haiku-4-5", // going with this fpr a quick test on the use case + its fast
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
    }

    conversationHistory.push({ role: "user", content: query });
    
    return {
        message: finalResponseText,
        toolResults: toolResultsSummary
    };
}

// export async function runAgent(userId: number, query: string): Promise<IAgentResponse> {

//     const conversationHistory = getConversationHistory(userId);
    
//     const currentMessages: Anthropic.MessageParam[] = [
//         ...conversationHistory,
//         { role: "user", content: query }
//     ];

//     const response = await claude.messages.create({
//         model: "claude-sonnet-4-20250514",
//         max_tokens: 4096,
//         system: SYSTEM_PROMPT,
//         tools: crmTools as any,
//         messages: currentMessages
//     });

//     // const toolBlock = response.content.find((block) => block.type === "tool_use");
//     // if (toolBlock) {
//     // return {
//     //     type: "tool_call",
//     //     id: toolBlock.id,
//     //     name: toolBlock.name,
//     //     args: toolBlock.input,
//     //     assistantMessage: { role: "assistant", content: response.content } 
//     // };
//     // }
//     // const textBlock = response.content.find((block) => block.type === "text");
//     // return { type: "text", text: textBlock?.text || "" };

//     // Handle tool use iterations
//     const maxIterations = 5;
//     let iteration = 0;
//     const toolResults: any[] = [];

//     while (response.stop_reason === "tool_use" && iteration < maxIterations) {
//         iteration++;

//         // Find all tool use blocks
//         const toolUseBlocks = response.content.filter(
//             (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
//         );

//         // Execute each tool
//         const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

//         for (const toolUse of toolUseBlocks) {
//             try {
//                 const result = await executeCRMTool(userId, toolUse.name, toolUse.input);
                
//                 toolResults.push({
//                     tool: toolUse.name,
//                     input: toolUse.input,
//                     result
//                 });

//                 toolResultBlocks.push({
//                     type: "tool_result",
//                     tool_use_id: toolUse.id,
//                     content: JSON.stringify(result, null, 2)
//                 });
//             } catch (error: any) {
//                 toolResultBlocks.push({
//                     type: "tool_result",
//                     tool_use_id: toolUse.id,
//                     content: JSON.stringify({ 
//                         success: false, 
//                         error: error.message 
//                     }),
//                     is_error: true
//                 });
//             }
//         }

//         // Continue conversation with tool results
//         messages.push({
//             role: "assistant",
//             content: response.content
//         });

//         messages.push({
//             role: "user",
//             content: toolResultBlocks
//         });

//         // Get next response from Claude
//         response = await claude.messages.create({
//             model: "claude-sonnet-4-20250514",
//             max_tokens: 4096,
//             system: SYSTEM_PROMPT,
//             tools: crmTools,
//             messages: messages
//         });
//     }

//     addToConversationHistory(userId, newUserMessage);
//     addToConversationHistory(userId, {
//         role: "assistant",
//         content: response.content
//     });
//     // Now these messages are part of history for NEXT request
    
//     return { message: "...", toolResults: [...] };
// };