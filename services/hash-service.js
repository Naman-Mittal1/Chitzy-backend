const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { HASH_SECRET } = require('../config');

class HashService {
    async hashPassword(password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }

    async validateHashedPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    hashOTP(data) {
        return crypto.createHmac('sha256', HASH_SECRET).update(data).digest('hex');
    }
}


module.exports = new HashService();