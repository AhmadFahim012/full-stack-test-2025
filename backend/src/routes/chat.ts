import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DatabaseService } from '../services/databaseService';
import { LLMService } from '../services/llmService';
import { createError } from '../middleware/errorHandler';

const router = Router();
const dbService = DatabaseService.getInstance();
const llmService = LLMService.getInstance();

/**
 * Get all chats for the authenticated user
 * GET /api/chat
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const chats = await dbService.getUserChats(req.user.id);
    
    res.json({
      chats,
      count: chats.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new chat
 * POST /api/chat
 */
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw createError('Chat title is required', 400);
    }

    const chat = await dbService.createChat({
      title: title.trim(),
      user_id: req.user.id
    });

    res.status(201).json({
      chat,
      message: 'Chat created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific chat with its messages
 * GET /api/chat/:chatId
 */
router.get('/:chatId', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { chatId } = req.params;

    if (!chatId) {
      throw createError('Chat ID is required', 400);
    }

    const chat = await dbService.getChat(chatId, req.user.id);
    if (!chat) {
      throw createError('Chat not found', 404);
    }

    const messages = await dbService.getChatMessages(chatId, req.user.id);

    res.json({
      chat,
      messages,
      count: messages.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update chat title
 * PUT /api/chat/:chatId
 */
router.put('/:chatId', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { chatId } = req.params;
    const { title } = req.body;

    if (!chatId) {
      throw createError('Chat ID is required', 400);
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw createError('Chat title is required', 400);
    }

    const chat = await dbService.updateChatTitle(chatId, req.user.id, title.trim());

    res.json({
      chat,
      message: 'Chat title updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a chat
 * DELETE /api/chat/:chatId
 */
router.delete('/:chatId', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { chatId } = req.params;

    if (!chatId) {
      throw createError('Chat ID is required', 400);
    }

    // Verify chat exists and belongs to user
    const chat = await dbService.getChat(chatId, req.user.id);
    if (!chat) {
      throw createError('Chat not found', 404);
    }

    await dbService.deleteChat(chatId, req.user.id);

    res.json({
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Send a message to a chat and get AI response
 * POST /api/chat/:chatId/messages
 */
router.post('/:chatId/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { chatId } = req.params;
    const { message } = req.body;

    if (!chatId) {
      throw createError('Chat ID is required', 400);
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw createError('Message content is required', 400);
    }

    // Verify chat exists and belongs to user
    const chat = await dbService.getChat(chatId, req.user.id);
    if (!chat) {
      throw createError('Chat not found', 404);
    }

    // Save user message
    const userMessage = await dbService.createMessage({
      chat_id: chatId,
      role: 'user',
      content: message.trim()
    });

    // Update chat timestamp
    await dbService.updateChatTimestamp(chatId, req.user.id);

    // Get chat history for context (last 10 messages)
    const chatHistory = await dbService.getChatMessages(chatId, req.user.id);
    const recentHistory = chatHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate AI response using LLM service
    const aiResponse = await llmService.generateResponse({
      message: message.trim(),
      chatHistory: recentHistory
    });

    // Save AI response
    const assistantMessage = await dbService.createMessage({
      chat_id: chatId,
      role: 'assistant',
      content: aiResponse.message
    });

    // Update chat timestamp again
    await dbService.updateChatTimestamp(chatId, req.user.id);

    // If this is the first message, update chat title based on user message
    if (chatHistory.length === 1) {
      const title = message.trim().substring(0, 50) + (message.trim().length > 50 ? '...' : '');
      await dbService.updateChatTitle(chatId, req.user.id, title);
    }

    res.json({
      userMessage,
      assistantMessage,
      message: 'Message sent and response generated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get messages for a specific chat
 * GET /api/chat/:chatId/messages
 */
router.get('/:chatId/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { chatId } = req.params;

    if (!chatId) {
      throw createError('Chat ID is required', 400);
    }

    const messages = await dbService.getChatMessages(chatId, req.user.id);

    res.json({
      messages,
      count: messages.length
    });
  } catch (error) {
    next(error);
  }
});

export { router as chatRouter };
