const jwt = require('jsonwebtoken');
const { JWT_ACCESS_TOKEN_SECRET_KEY, JWT_REFRESH_TOKEN_SECRET_KEY } = require('../config');
const RefreshModel = require('../models/refresh-model');

class TokenService {
    // generateAccessToken(payload) {
    //     const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET_KEY, {
    //         expiresIn: '1m'
    //     });



    //     return accessToken;
    // }

    // generateRefreshToken(payload) {
    //     const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET_KEY, {
    //         expiresIn: '1y'
    //     });

    //     return refreshToken;
    // }


    generateTokens(payload) {
        const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: '1m'
        });

        const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET_KEY, {
            expiresIn: '1y'
        });

        return { accessToken, refreshToken };
    }

    async verifyAccessToken(token) {
        return jwt.verify(token, JWT_ACCESS_TOKEN_SECRET_KEY);
    }

    async verifyRefreshToken(refreshToken) {
        return jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET_KEY);
    }

    async storeRefreshToken(token, userId) {
        try {
            await RefreshModel.create({
                token,
                userId,

            });
        } catch (err) {
            console.log(err);
        }
    }

    async verifyRefreshToken(refreshToken) {
        return jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET_KEY);
    }

    async findRefreshToken(userId, refreshToken) {
        return await RefreshModel.findOne({ userId, token: refreshToken });
    }

    async updateRefreshToken(userId, refreshToken) {
        return await RefreshModel.updateOne({ userId }, { token: refreshToken });
    }

    async removeToken(refreshToken) {
        return await RefreshModel.deleteOne({ token: refreshToken });
    }
}

module.exports = new TokenService();