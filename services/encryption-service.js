const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


class EncryptionService {
    encryptImageFile(fileData, encryptionKey) {
        const cipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, '5183666c72eec9e4');
        console.log(encryptionKey);
        let encryptedData = cipher.update(fileData, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        return encryptedData;
    }

}
module.exports = new EncryptionService();