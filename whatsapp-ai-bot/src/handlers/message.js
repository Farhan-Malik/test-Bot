class MessageHandler {
    constructor(bot) {
        this.bot = bot;
    }

    extractText(message) {
        return message.message?.conversation || 
               message.message?.extendedTextMessage?.text || 
               message.message?.imageMessage?.caption ||
               '';
    }

    isCommand(text) {
        const prefixes = this.bot.config.handlers || ['.', '!', '/'];
        return prefixes.some(prefix => text.startsWith(prefix));
    }

    async processMessage(message, sock) {
        const text = this.extractText(message);
        if (!text) return;

        if (this.isCommand(text)) {
            await this.bot.commandHandler.handleMessage({ messages: [message] }, sock);
        } else {
            // Handle regular conversation
            await this.handleConversation(message, text, sock);
        }
    }

    async handleConversation(message, text, sock) {
        // Only respond in private chats or when mentioned in groups
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        const isMentioned = isGroup && 
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
                sock.user.id.split(':')[0] + '@s.whatsapp.net'
            );

        if (!isGroup || isMentioned) {
            // Use AI to generate response
            if (this.bot.aiProviders.chatgpt) {
                await this.generateAIResponse(message, text, sock);
            }
        }
    }

    async generateAIResponse(message, text, sock) {
        try {
            // Remove bot mention if present
            const cleanText = text.replace(/@\d+/g, '').trim();
            
            const completion = await this.bot.aiProviders.chatgpt.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful WhatsApp assistant. Keep responses concise, friendly, and under 2-3 sentences unless asked for more detail." 
                    },
                    { role: "user", content: cleanText }
                ],
                max_tokens: 150
            });

            const response = completion.choices[0].message.content;
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: response 
            });

        } catch (error) {
            this.bot.logger.error('AI response error:', error);
        }
    }
}

module.exports = MessageHandler;
