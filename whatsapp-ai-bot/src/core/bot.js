const ConnectionHandler = require('./connection');
const CommandHandler = require('../handlers/command');
const MessageHandler = require('../handlers/message');
const DatabaseManager = require('../utils/database');
const Logger = require('../utils/logger');

class WhatsAppAIBot {
    constructor() {
        this.sock = null;
        this.db = new DatabaseManager();
        this.logger = new Logger();
        this.commandHandler = new CommandHandler(this);
        this.messageHandler = new MessageHandler(this);
        this.connection = new ConnectionHandler(this);
        this.aiProviders = {};
        this.config = {};
    }

    async initialize() {
        try {
            this.logger.info('🚀 Initializing WhatsApp AI Bot...');
            
            // Load configuration
            await this.loadConfig();
            
            // Initialize AI providers
            await this.initializeAIProviders();
            
            // Connect to WhatsApp
            await this.connection.initialize();
            
            this.logger.info('✅ Bot initialized successfully!');
        } catch (error) {
            this.logger.error('❌ Failed to initialize bot:', error);
            throw error;
        }
    }

    async loadConfig() {
        this.config = require('../../config/default.json');
        this.logger.info('📁 Configuration loaded');
    }

    async initializeAIProviders() {
        if (process.env.ENABLE_CHATGPT === 'true' && process.env.OPENAI_API_KEY) {
            const { OpenAI } = require('openai');
            this.aiProviders.chatgpt = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            this.logger.info('🤖 ChatGPT provider initialized');
        } else {
            this.logger.warn('⚠️ ChatGPT disabled - No API key provided');
        }

        if (process.env.ENABLE_GEMINI === 'true' && process.env.GEMINI_API_KEY) {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            this.aiProviders.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.logger.info('🔷 Gemini AI provider initialized');
        } else {
            this.logger.warn('⚠️ Gemini AI disabled - No API key provided');
        }
    }

    getSock() {
        return this.sock;
    }

    setSock(sock) {
        this.sock = sock;
        this.connection.setSock(sock);
    }
}

module.exports = WhatsAppAIBot;
