#!/bin/bash

echo "📦 Installing WhatsApp AI Bot Dependencies..."

# Clean start (if needed)
rm -rf node_modules package-lock.json

# Create package.json with working versions
cat > package.json << 'PACKAGE_EOF'
{
  "name": "whatsapp-ai-bot",
  "version": "1.0.0",
  "description": "WhatsApp Bot with ChatGPT and Gemini AI integration",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "dev": "nodemon main.js",
    "test": "jest",
    "auth": "node src/core/session.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "6.7.8",
    "axios": "1.7.7",
    "pino": "9.6.0",
    "qrcode-terminal": "0.12.0",
    "openai": "4.52.0",
    "@google/generative-ai": "0.21.0",
    "fluent-ffmpeg": "2.1.3",
    "ytdl-core": "4.11.5",
    "dotenv": "16.4.5",
    "form-data": "4.0.0",
    "fs-extra": "11.2.0"
  },
  "devDependencies": {
    "nodemon": "3.0.2"
  },
  "keywords": ["whatsapp", "bot", "ai", "chatgpt", "gemini"],
  "author": "Your Name",
  "license": "MIT"
}
PACKAGE_EOF

echo "✅ Created package.json with verified versions"
echo "📥 Installing dependencies..."

# Install all dependencies
npm install

echo "🎉 Dependencies installed successfully!"
echo "📁 Next: Edit .env file with your API keys and run 'npm start'"
