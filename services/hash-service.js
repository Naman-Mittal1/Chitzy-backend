const bcrypt = require('bcrypt');
const { HASH_SECRET } = require('../config');

class HashService {
    async hashPassword(password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }

    async validateHashedPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}


module.exports = new HashService();