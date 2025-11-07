const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs-extra');

class ConnectionHandler {
    constructor(bot) {
        this.bot = bot;
        this.sock = null;
    }

    async initialize() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../../session'));
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }), // Silent for cleaner output
                printQRInTerminal: true,
                auth: state,
                markOnlineOnConnect: false,
            });

            this.bot.setSock(this.sock);

            // Setup event handlers
            this.setupEventHandlers(saveCreds);
            
            this.bot.logger.info('📱 WhatsApp connection initialized');
        } catch (error) {
            this.bot.logger.error('❌ Connection failed:', error);
            throw error;
        }
    }

    setupEventHandlers(saveCreds) {
        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
                this.bot.logger.warn('Connection closed, reconnecting:', shouldReconnect);
                
                if (shouldReconnect) {
                    setTimeout(() => this.initialize(), 5000);
                }
            } else if (connection === 'open') {
                this.bot.logger.info('✅ Connected to WhatsApp successfully!');
                this.sendStartupMessage();
            }
        });

        // Handle incoming messages
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.bot.messageHandler.processMessage(m.messages[0], this.sock);
        });
    }

    async sendStartupMessage() {
        const botId = this.sock.user.id.split(':')[0] + '@s.whatsapp.net';
        try {
            await this.sock.sendMessage(botId, { 
                text: `🤖 *WhatsApp AI Bot Started!*\n\nAvailable AI Providers: ${Object.keys(this.bot.aiProviders).join(', ') || 'None'}\n\nUse .help to see available commands.` 
            });
        } catch (error) {
            this.bot.logger.warn('Could not send startup message:', error.message);
        }
    }

    setSock(sock) {
        this.sock = sock;
    }
}

module.exports = ConnectionHandler;
