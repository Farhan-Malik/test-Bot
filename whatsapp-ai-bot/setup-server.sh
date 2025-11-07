
#!/bin/bash

echo "🚀 Setting up WhatsApp AI Bot on AWS..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install FFmpeg for media processing
sudo apt install -y ffmpeg

# Install Git
sudo apt install -y git

# Verify installations
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PM2 version: $(pm2 -v)"
echo "FFmpeg version: $(ffmpeg -version | head -n1)"

echo "✅ Server setup complete!"
