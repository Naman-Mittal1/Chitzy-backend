const crypto = require('crypto');
const hashService = require('./hash-service');
const mailService = require('./mail-service');

class OTPService {
    async generateOTP() {
        const otp = crypto.randomInt(1000, 9999);
        return otp;
    }

    verifyOTP(hashedOTP, data) {
        const computedHash = hashService.hashOTP(data);
        return computedHash === hashedOTP;
    }
}

module.exports = new OTPService();