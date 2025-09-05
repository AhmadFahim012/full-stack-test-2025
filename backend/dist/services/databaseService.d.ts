export interface Chat {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}
export interface Message {
    id: string;
    chat_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}
export interface CreateChatRequest {
    title: string;
    user_id: string;
}
export interface CreateMessageRequest {
    chat_id: string;
    role: 'user' | 'assistant';
    content: string;
}
export declare class DatabaseService {
    private static instance;
    private constructor();
    static getInstance(): DatabaseService;
    createChat(request: CreateChatRequest): Promise<Chat>;
    getUserChats(userId: string): Promise<Chat[]>;
    getChat(chatId: string, userId: string): Promise<Chat | null>;
    updateChatTitle(chatId: string, userId: string, title: string): Promise<Chat>;
    deleteChat(chatId: string, userId: string): Promise<void>;
    createMessage(request: CreateMessageRequest): Promise<Message>;
    getChatMessages(chatId: string, userId: string): Promise<Message[]>;
    getLatestMessage(chatId: string, userId: string): Promise<Message | null>;
    updateChatTimestamp(chatId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=databaseService.d.ts.map