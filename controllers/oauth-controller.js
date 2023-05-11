const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, BASE_URL } = require("../config");
const oauthService = require("../services/oauth-service");
const axios = require('axios');
const UserModel = require('../models/user-model');
const { USER_NOT_FOUND_ERR } = require("../errors");
const tokenService = require("../services/token-service");
const UserDto = require("../dtos/user-dto");


const redirectURI = "auth/google";
class OAuthController {
    async authenticateGoogleUser(req, res) {

        const code = req.query.code;

        const { id_token, access_token } = await oauthService.getTokens({
            code,
            clientId: OAUTH_CLIENT_ID,
            clientSecret: OAUTH_CLIENT_SECRET,
            redirectUri: `${BASE_URL}/${redirectURI}`,
        });

        // Fetch the user's profile with the access token and bearer
        const googleUser = await axios
            .get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
                    headers: {
                        Authorization: `Bearer ${id_token}`,
                    },
                }
            )
            .then((res) => res.data)
            .catch((error) => {
                console.error(`Failed to fetch user`);
                throw new Error(error.message);
            });



        const existingUser = await UserModel.findOne({
            email: googleUser.email
        });




        if (!existingUser) {
            console.log(googleUser);

            // return res.status(404).json({ error: USER_NOT_FOUND_ERR });

            const name = googleUser.name;
            const email = googleUser.email;

            const user = new UserModel({ name, email, verified: true });
            await user.save();
            const accessToken = tokenService.generateAccessToken({ userId: user._id });
            const refreshToken = tokenService.generateAccessToken({ userId: user._id });

            await tokenService.storeRefreshToken(refreshToken, user._id);
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            });

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            });

            const userDto = new UserDto(user);
            res.redirect(process.env.CLIENT_URL);

        }

        console.log(existingUser);

        const accessToken = tokenService.generateAccessToken({ userId: existingUser._id });
        const refreshToken = tokenService.generateRefreshToken({ userId: existingUser._id });


        await tokenService.storeRefreshToken(refreshToken, existingUser._id);
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        const userDto = new UserDto(existingUser);
        console.log(userDto);
        res.redirect(process.env.CLIENT_URL);

    }

    async getMe(req, res) {
        console.log("get me");
        try {
            if (!req.cookies['accessToken']) {
                return res.send(null);
            }
            const decoded = await tokenService.verifyAccessToken(req.cookies['accessToken']);
            console.log("decoded", decoded);
            return res.send(decoded);
        } catch (err) {
            console.log(err);
            res.send(null);
        }
    }
}

module.exports = new OAuthController();