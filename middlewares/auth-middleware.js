const tokenService = require("../services/token-service");
const { JWT_DECODE_ERR } = require('../errors');

module.exports = async function(req, res, next) {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            throw new Error();
        }

        const { userId } = await tokenService.verifyAccessToken(accessToken);
        if (!userData) {
            throw new Error();
        }
        req.userId = userId;
        next();
    } catch (err) {
        res.status(401).json({ message: JWT_DECODE_ERR });
    }
}