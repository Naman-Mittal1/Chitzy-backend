const tokenService = require("../services/token-service");
const { JWT_DECODE_ERR } = require('../errors');

module.exports = async function(req, res, next) {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = await tokenService.verifyAccessToken(accessToken);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: JWT_DECODE_ERR });
    }
}