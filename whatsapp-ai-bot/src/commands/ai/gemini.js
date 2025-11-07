const command = {
    name: 'gemini',
    description: 'Chat with Google Gemini',
    usage: '.gemini <your question>',
    async execute(message, sock, args, bot) {
        const question = args.join(' ');
        
        if (!question) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide a question. Usage: .gemini <your question>'
            });
            return;
        }

        try {
            await sock.sendMessage(message.key.remoteJid, {
                text: '🤔 Thinking...'
            });

            const model = bot.aiProviders.gemini.getGenerativeModel({ 
                model: "gemini-pro" 
            });
            
            const result = await model.generateContent(question);
            const response = await result.response;
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: response.text() 
            });

        } catch (error) {
            bot.logger.error('Gemini error:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Error communicating with Gemini. Please try again.'
            });
        }
    }
};

module.exports = { command, execute: command.execute };
