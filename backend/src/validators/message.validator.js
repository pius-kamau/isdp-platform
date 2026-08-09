const { z } = require('zod');

// Send message validation
const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, 'Receiver ID is required'),
    messageText: z.string().max(2000, 'Message must be less than 2000 characters').optional(),
    attachmentUrl: z.array(z.string().url('Invalid URL format')).optional(),
    parentId: z.string().optional(),
  }).refine(
    (data) => data.messageText || (data.attachmentUrl && data.attachmentUrl.length > 0),
    { message: 'Message text or attachment is required' }
  ),
});

// Get conversation validation
const getConversationSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
  }),
});

// Message ID param
const messageIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Message ID is required'),
  }),
});

module.exports = {
  sendMessageSchema,
  getConversationSchema,
  messageIdParamSchema,
};