const fs = require('fs-extra');
const path = require('path');

class SessionManager {
    constructor() {
        this.sessionPath = path.join(__dirname, '../../session');
    }

    async ensureSessionDir() {
        await fs.ensureDir(this.sessionPath);
    }

    async sessionExists() {
        return await fs.pathExists(path.join(this.sessionPath, 'creds.json'));
    }

    async clearSession() {
        if (await this.sessionExists()) {
            await fs.remove(this.sessionPath);
            await this.ensureSessionDir();
        }
    }
}

module.exports = SessionManager;
