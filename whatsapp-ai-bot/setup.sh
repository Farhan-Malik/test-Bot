#!/bin/bash

echo "�� Setting up WhatsApp AI Bot..."

# Create folder structure
mkdir -p whatsapp-ai-bot/{src/{core,handlers,commands/{ai,media,group,system},utils,plugins},config,database,session,temp,tests}
cd whatsapp-ai-bot

# Create all files
touch main.js package.json .env.example .gitignore
touch src/core/{bot.js,connection.js,session.js}
touch src/handlers/{command.js,message.js,event.js}
touch src/commands/ai/{chatgpt.js,gemini.js,advanced.js}
touch src/commands/media/{downloader.js,sticker.js}
touch src/commands/group/{admin.js,moderation.js}
touch src/commands/system/{config.js,update.js}
touch src/utils/{database.js,helpers.js,logger.js}
touch config/{default.json,development.json}
touch database/data.json
touch tests/{bot.test.js,ai.test.js}

# Make setup script executable
chmod +x setup.sh

echo "✅ Project structure created!"
echo "📁 Folder structure:"
find . -type d | sort
echo ""
echo "🎉 Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Copy .env.example to .env and add your API keys"
echo "3. Run 'npm start' to start the bot"
