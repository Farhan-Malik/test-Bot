
const fs = require('fs-extra');
const path = require('path');

class DatabaseManager {
    constructor() {
        this.filePath = path.join(__dirname, '../../database/data.json');
        this.data = this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(this.filePath)) {
                return fs.readJsonSync(this.filePath);
            }
        } catch (error) {
            console.error('Error loading database:', error);
        }

        // Default database structure
        return {
            users: {},
            groups: {},
            settings: {},
            conversations: {},
            filters: []
        };
    }

    saveData() {
        try {
            fs.ensureDirSync(path.dirname(this.filePath));
            fs.writeJsonSync(this.filePath, this.data, { spaces: 2 });
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    getUser(userId) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                id: userId,
                name: '',
                isAdmin: false,
                isBanned: false,
                conversationHistory: []
            };
        }
        return this.data.users[userId];
    }

    updateUser(userId, data) {
        const user = this.getUser(userId);
        Object.assign(user, data);
        this.saveData();
    }

    getConversationHistory(userId) {
        const user = this.getUser(userId);
        return user.conversationHistory;
    }

    addConversationMessage(userId, role, content) {
        const user = this.getUser(userId);
        user.conversationHistory.push({ role, content });
        
        // Keep only last 10 messages for context
        if (user.conversationHistory.length > 10) {
            user.conversationHistory = user.conversationHistory.slice(-10);
        }
        
        this.saveData();
    }
}

module.exports = DatabaseManager;
