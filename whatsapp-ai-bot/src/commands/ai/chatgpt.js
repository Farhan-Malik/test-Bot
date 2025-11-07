const command = {
    name: 'gpt',
    description: 'Chat with GPT-4',
    usage: '.gpt <your question>',
    async execute(message, sock, args, bot) {
        const question = args.join(' ');
        
        if (!question) {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Please provide a question. Usage: .gpt <your question>'
            });
            return;
        }

        try {
            await sock.sendMessage(message.key.remoteJid, {
                text: '🤔 Thinking...'
            });

            const completion = await bot.aiProviders.chatgpt.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful WhatsApp assistant. Provide clear, concise responses." },
                    { role: "user", content: question }
                ],
                max_tokens: 1000
            });

            const response = completion.choices[0].message.content;
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: response 
            });

            // Save to conversation history
            bot.db.addConversationMessage(
                message.key.remoteJid, 
                'user', 
                question
            );
            bot.db.addConversationMessage(
                message.key.remoteJid, 
                'assistant', 
                response
            );

        } catch (error) {
            bot.logger.error('ChatGPT error:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Error communicating with ChatGPT. Please try again.'
            });
        }
    }
};

module.exports = { command, execute: command.execute };
