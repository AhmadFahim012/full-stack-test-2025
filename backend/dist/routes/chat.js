"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const databaseService_1 = require("../services/databaseService");
const llmService_1 = require("../services/llmService");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.chatRouter = router;
const dbService = databaseService_1.DatabaseService.getInstance();
const llmService = llmService_1.LLMService.getInstance();
router.get('/', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const chats = await dbService.getUserChats(req.user.id);
        res.json({
            chats,
            count: chats.length
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { title } = req.body;
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            throw (0, errorHandler_1.createError)('Chat title is required', 400);
        }
        const chat = await dbService.createChat({
            title: title.trim(),
            user_id: req.user.id
        });
        res.status(201).json({
            chat,
            message: 'Chat created successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:chatId', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { chatId } = req.params;
        if (!chatId) {
            throw (0, errorHandler_1.createError)('Chat ID is required', 400);
        }
        const chat = await dbService.getChat(chatId, req.user.id);
        if (!chat) {
            throw (0, errorHandler_1.createError)('Chat not found', 404);
        }
        const messages = await dbService.getChatMessages(chatId, req.user.id);
        res.json({
            chat,
            messages,
            count: messages.length
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:chatId', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { chatId } = req.params;
        const { title } = req.body;
        if (!chatId) {
            throw (0, errorHandler_1.createError)('Chat ID is required', 400);
        }
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            throw (0, errorHandler_1.createError)('Chat title is required', 400);
        }
        const chat = await dbService.updateChatTitle(chatId, req.user.id, title.trim());
        res.json({
            chat,
            message: 'Chat title updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:chatId', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { chatId } = req.params;
        if (!chatId) {
            throw (0, errorHandler_1.createError)('Chat ID is required', 400);
        }
        const chat = await dbService.getChat(chatId, req.user.id);
        if (!chat) {
            throw (0, errorHandler_1.createError)('Chat not found', 404);
        }
        await dbService.deleteChat(chatId, req.user.id);
        res.json({
            message: 'Chat deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:chatId/messages', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { chatId } = req.params;
        const { message } = req.body;
        if (!chatId) {
            throw (0, errorHandler_1.createError)('Chat ID is required', 400);
        }
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            throw (0, errorHandler_1.createError)('Message content is required', 400);
        }
        const chat = await dbService.getChat(chatId, req.user.id);
        if (!chat) {
            throw (0, errorHandler_1.createError)('Chat not found', 404);
        }
        const userMessage = await dbService.createMessage({
            chat_id: chatId,
            role: 'user',
            content: message.trim()
        });
        await dbService.updateChatTimestamp(chatId, req.user.id);
        const chatHistory = await dbService.getChatMessages(chatId, req.user.id);
        const recentHistory = chatHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        const aiResponse = await llmService.generateResponse({
            message: message.trim(),
            chatHistory: recentHistory
        });
        const assistantMessage = await dbService.createMessage({
            chat_id: chatId,
            role: 'assistant',
            content: aiResponse.message
        });
        await dbService.updateChatTimestamp(chatId, req.user.id);
        if (chatHistory.length === 1) {
            const title = message.trim().substring(0, 50) + (message.trim().length > 50 ? '...' : '');
            await dbService.updateChatTitle(chatId, req.user.id, title);
        }
        res.json({
            userMessage,
            assistantMessage,
            message: 'Message sent and response generated successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:chatId/messages', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { chatId } = req.params;
        if (!chatId) {
            throw (0, errorHandler_1.createError)('Chat ID is required', 400);
        }
        const messages = await dbService.getChatMessages(chatId, req.user.id);
        res.json({
            messages,
            count: messages.length
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=chat.js.map