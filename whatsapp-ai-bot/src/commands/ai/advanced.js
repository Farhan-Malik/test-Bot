const command = {
    name: 'ask',
    description: 'Ask any question to AI',
    usage: '.ask <your question>',
    async execute(message, sock, args, bot) {
        const question = args.join(' ');
        
        if (!question) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide a question. Usage: .ask <your question>'
            });
            return;
        }

        try {
            await sock.sendMessage(message.key.remoteJid, {
                text: '🤔 Thinking...'
            });

            // Use conversation history for context
            const history = bot.db.getConversationHistory(message.key.remoteJid);
            
            const messages = [
                { 
                    role: "system", 
                    content: "You are a helpful AI assistant. Provide clear, concise answers." 
                },
                ...history,
                { role: "user", content: question }
            ];

            const completion = await bot.aiProviders.chatgpt.chat.completions.create({
                model: "gpt-4",
                messages: messages,
                max_tokens: 500
            });

            const response = completion.choices[0].message.content;
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: response 
            });

            // Update conversation history
            bot.db.addConversationMessage(message.key.remoteJid, 'user', question);
            bot.db.addConversationMessage(message.key.remoteJid, 'assistant', response);

        } catch (error) {
            bot.logger.error('AI error:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Error processing your question. Please try again.'
            });
        }
    }
};

module.exports = { command, execute: command.execute };
