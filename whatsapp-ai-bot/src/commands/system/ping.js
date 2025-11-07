const command = {
    name: 'ping',
    description: 'Check if bot is alive and response time',
    usage: '.ping',
    async execute(message, sock, args, bot) {
        const start = Date.now();
        await sock.sendMessage(message.key.remoteJid, { text: '🏓 Pong!' });
        const latency = Date.now() - start;
        
        await sock.sendMessage(message.key.remoteJid, {
            text: `✅ Bot is alive!\n⏱️ Response time: ${latency}ms\n🤖 AI Providers: ${Object.keys(bot.aiProviders).join(', ')}`
        });
    }
};

module.exports = { command, execute: command.execute };
