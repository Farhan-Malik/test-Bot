require('dotenv').config();
const WhatsAppAIBot = require('./src/core/bot');

class MainApp {
    constructor() {
        this.bot = new WhatsAppAIBot();
    }

    async start() {
        try {
            console.log('🚀 Starting WhatsApp AI Bot...');
            
            // Validate environment
            this.validateEnvironment();
            
            // Initialize bot
            await this.bot.initialize();
            
            // Setup graceful shutdown
            this.setupGracefulShutdown();
            
            console.log('✅ Bot started successfully!');
            console.log('📱 Scan the QR code to connect WhatsApp');
            
        } catch (error) {
            console.error('❌ Failed to start bot:', error);
            process.exit(1);
        }
    }

    validateEnvironment() {
        const required = ['OPENAI_API_KEY', 'GEMINI_API_KEY'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing environment variables: ${missing.join(', ')}`);
        }
    }

    setupGracefulShutdown() {
        const shutdown = async () => {
            console.log('\n🛑 Shutting down bot gracefully...');
            try {
                if (this.bot.db) {
                    this.bot.db.saveData();
                }
                console.log('✅ Bot shutdown complete');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
}

// Start the application
const app = new MainApp();
app.start();
