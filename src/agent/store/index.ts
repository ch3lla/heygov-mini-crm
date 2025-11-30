import type { Anthropic } from "@anthropic-ai/sdk";

/**
 * In-memory conversation storage
 * In production, store this in Redis or database
 */
const conversationStore = new Map<string, Anthropic.MessageParam[]>();

/**
 * Get conversation history for a user
 */
export const getConversationHistory = (userId: number): Anthropic.MessageParam[] => {
    const key = `user_${userId}`;
    return conversationStore.get(key) || [];
};

/**
 * Add message to conversation history
 */
export const addToConversationHistory = (
    userId: number, 
    message: Anthropic.MessageParam
): void => {
    const key = `user_${userId}`;
    const history = conversationStore.get(key) || [];
    history.push(message);
    
    // Keep only last 20 messages (10 exchanges) to avoid context overflow
    if (history.length > 20) {
        history.shift();
    }
    
    conversationStore.set(key, history);
};

/**
 * Clear conversation history for a user
 */
export const clearConversationHistory = (userId: number): void => {
    const key = `user_${userId}`;
    conversationStore.delete(key);
};

/**
 * Get conversation summary (for debugging)
 */
export const getConversationSummary = (userId: number): {
    messageCount: number;
    lastMessage?: string;
} => {
    const history = getConversationHistory(userId);
    const lastMessage = history[history.length - 1];
    
    const preview = lastMessage
        ? `${lastMessage.role}: ${typeof lastMessage.content === 'string' ? lastMessage.content.substring(0, 50) : '[complex content]'}...`
        : undefined;

    if (preview !== undefined) {
        return {
            messageCount: history.length,
            lastMessage: preview
        };
    }

    return {
        messageCount: history.length
    };
};