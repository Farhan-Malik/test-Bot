
const path = require('path');
const fs = require('fs-extra');

class CommandHandler {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Map();
        this.loadCommands();
    }

    loadCommands() {
        try {
            const commandsDir = path.join(__dirname, '../commands');
            this.loadCommandCategory(commandsDir);
            this.bot.logger.info(`📦 Loaded ${this.commands.size} commands`);
        } catch (error) {
            this.bot.logger.error('Error loading commands:', error);
        }
    }

    loadCommandCategory(categoryPath) {
        if (!fs.existsSync(categoryPath)) return;

        const items = fs.readdirSync(categoryPath);
        
        for (const item of items) {
            const itemPath = path.join(categoryPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                this.loadCommandCategory(itemPath);
            } else if (item.endsWith('.js')) {
                try {
                    const commandModule = require(itemPath);
                    if (commandModule.command && commandModule.execute) {
                        this.commands.set(commandModule.command.name, commandModule);
                        this.bot.logger.debug(`Loaded command: ${commandModule.command.name}`);
                    }
                } catch (error) {
                    this.bot.logger.error(`Error loading command ${item}:`, error);
                }
            }
        }
    }

    async handleMessage(m) {
        if (!m.messages || m.messages.length === 0) return;

        const message = m.messages[0];
        const text = this.extractText(message);
        if (!text) return;

        const sock = this.bot.getSock();
        if (!sock) return;

        // Check for command prefix
        const prefix = this.getPrefix(text);
        if (!prefix) {
            // Handle AI conversation (non-command messages)
            await this.handleAIConversation(message, text, sock);
            return;
        }

        const commandText = text.slice(prefix.length).trim();
        const [commandName, ...args] = commandText.split(' ');

        const command = this.commands.get(commandName.toLowerCase());
        if (command) {
            try {
                await command.execute(message, sock, args, this.bot);
                this.bot.logger.info(`Command executed: ${commandName} by ${message.key.remoteJid}`);
            } catch (error) {
                this.bot.logger.error(`Error executing command ${commandName}:`, error);
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ Error executing command. Please try again.'
                });
            }
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: `❌ Command not found. Use .help to see available commands.`
            });
        }
    }

    extractText(message) {
        return message.message?.conversation || 
               message.message?.extendedTextMessage?.text || 
               message.message?.imageMessage?.caption ||
               '';
    }

    getPrefix(text) {
        const prefixes = this.bot.config.handlers || ['.', '!', '/'];
        return prefixes.find(prefix => text.startsWith(prefix));
    }

    async handleAIConversation(message, text, sock) {
        // Only respond to direct messages or when mentioned in groups
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        const isMentioned = isGroup && 
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
                this.bot.getSock().user.id.split(':')[0] + '@s.whatsapp.net'
            );

        if (!isGroup || isMentioned) {
            // Use AI to generate response
            if (this.bot.aiProviders.chatgpt) {
                await this.generateAIResponse(message, text, sock, 'chatgpt');
            }
        }
    }

    async generateAIResponse(message, text, sock, provider = 'chatgpt') {
        try {
            const ai = this.bot.aiProviders[provider];
            if (!ai) return;

            let response;
            if (provider === 'chatgpt') {
                const completion = await ai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a helpful WhatsApp assistant. Keep responses concise and friendly." },
                        { role: "user", content: text }
                    ],
                    max_tokens: 500
                });
                response = completion.choices[0].message.content;
            }

            if (response) {
                await sock.sendMessage(message.key.remoteJid, { text: response });
            }
        } catch (error) {
            this.bot.logger.error('AI response error:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Sorry, I encountered an error processing your message.'
            });
        }
    }
}

module.exports = CommandHandler;
