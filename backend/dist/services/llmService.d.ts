export interface LLMResponse {
    id: string;
    message: string;
    timestamp: string;
    model: string;
}
export interface LLMRequest {
    message: string;
    chatHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}
export declare class LLMService {
    private static instance;
    private constructor();
    static getInstance(): LLMService;
    generateResponse(request: LLMRequest): Promise<LLMResponse>;
    private getRandomDelay;
    private sleep;
    private addContextToResponse;
    generateStreamingResponse(request: LLMRequest): AsyncGenerator<string, void, unknown>;
}
//# sourceMappingURL=llmService.d.ts.map