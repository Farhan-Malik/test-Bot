const path = require('path');
const fs = require('fs-extra');

class CommandHandler {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Map();
        this.loadAllCommands();
    }

    loadAllCommands() {
        try {
            const commandsDir = path.join(__dirname, '../commands');
            this.loadCommandsFromDirectory(commandsDir);
            this.bot.logger.info(`📦 Loaded ${this.commands.size} commands`);
        } catch (error) {
            this.bot.logger.error('Error loading commands:', error);
        }
    }

    loadCommandsFromDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                this.loadCommandsFromDirectory(itemPath);
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

    async handleMessage(m, sock) {
        if (!m.messages || m.messages.length === 0) return;

        const message = m.messages[0];
        const text = this.extractText(message);
        if (!text) return;

        // Check for command prefix
        const prefix = this.getPrefix(text);
        if (!prefix) return;

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
                text: `❌ Command "${commandName}" not found. Use .help to see available commands.`
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
        const prefixes = this.bot.config?.handlers || ['.', '!', '/'];
        return prefixes.find(prefix => text.startsWith(prefix));
    }
}

module.exports = CommandHandler;
