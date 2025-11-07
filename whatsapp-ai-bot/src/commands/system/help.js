const command = {
    name: 'help',
    description: 'Show all available commands',
    usage: '.help [command]',
    async execute(message, sock, args, bot) {
        const commands = Array.from(bot.commands.values());
        
        if (args.length > 0) {
            // Show specific command help
            const cmdName = args[0].toLowerCase();
            const cmd = commands.find(c => c.command.name === cmdName);
            
            if (cmd) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `🤖 *${cmd.command.name}*\n\n📝 ${cmd.command.description}\n💡 Usage: ${cmd.command.usage}`
                });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    text: `❌ Command "${args[0]}" not found. Use .help to see all commands.`
                });
            }
            return;
        }

        // Show all commands
        let helpText = '🤖 *WhatsApp AI Bot Commands*\n\n';
        
        helpText += '*🤖 AI Commands:*\n';
        commands.filter(c => c.command.name === 'gpt' || c.command.name === 'gemini')
                .forEach(cmd => {
                    helpText += `• .${cmd.command.name} - ${cmd.command.description}\n`;
                });
        
        helpText += '\n*⚙️ System Commands:*\n';
        commands.filter(c => c.command.name === 'help' || c.command.name === 'ping')
                .forEach(cmd => {
                    helpText += `• .${cmd.command.name} - ${cmd.command.description}\n`;
                });

        helpText += '\n💡 Use `.help <command>` for more info about a specific command.';

        await sock.sendMessage(message.key.remoteJid, { text: helpText });
    }
};

module.exports = { command, execute: command.execute };
