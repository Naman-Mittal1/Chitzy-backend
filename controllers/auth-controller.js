const passport = require('passport');
const { USER_ALREADY_EXISTS } = require("../constant");
const { SOMETHING_WENT_WRONG, INVALID_CREDENTIALS, WRONG_PASSWORD, JWT_DECODE_ERR, USER_NOT_FOUND_ERR, WRONG_OTP_ERR, OTP_EXPIRING_ERR, DATABASE_ERR } = require('../errors');
const validationService = require("../services/validation-service");
const hashService = require('../services/hash-service');
const tokenService = require('../services/token-service');
const UserModel = require('../models/user-model');
const UserDto = require('../dtos/user-dto');
const mailService = require("../services/mail-service");
const { MESSGE_SENDING_FAILED } = require('../errors');
const otpService = require('../services/otp-service');
const userService = require('../services/user-service');

class AuthController {
    async register(req, res) {
        try {
            const errors = validationService.checkValidation(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { name, email, password } = req.body;
            let { phone } = req.body;

            if (!phone) {
                phone = "";
            }


            let user = await UserModel.findOne({ email });
            if (user) {
                return res.status(409).json({ message: USER_ALREADY_EXISTS });
            }

            const hashedPassword = await hashService.hashPassword(password);

            await mailService.sendVerificationCode(name, email);


            return res.status(200).json({ message: "Verification Code sent to email" });
            // user = new UserModel({ name, email, password: hashedPassword });
            // await user.save();

            // const userDto = new UserDto(user);
            // res.json({ user: userDto, auth: true, accessToken, message: "User registered successfully" });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: SOMETHING_WENT_WRONG });
        }
    }

    async sendOTP(req, res) {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email Field is required" });
        }


        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({ message: USER_ALREADY_EXISTS });
        }


        const otp = await otpService.generateOTP();
        const otpExpirationTimeInMinutes = 10;
        const ttl = 1000 * 60 * otpExpirationTimeInMinutes; // Time to leave
        const expires = Date.now() + ttl;
        const data = `${email}.${otp}.${expires}`;
        const otpHash = hashService.hashOTP(data);

        try {
            // mail send ka code aayega
            console.log({ hash: `${otpHash}.${expires}`, email, otp });
            return res.json({ hash: `${otpHash}.${expires}`, email, otp });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: MESSGE_SENDING_FAILED });
        }
    }


    async verifyOTP(req, res) {
        const { otp, hash, email } = req.body;
        try {
            if (!otp) {
                res.status(400).json({ error: "OTP is required" });
            }

            if (!hash) {
                res.status(400).json({ error: "Hash is required" });
            }

            if (!email) {
                res.status(400).json({ error: "Email is required" });
            }


            const [hashedOTP, expires] = hash.split('.');
            if (Date.now() > +expires) {
                res.status(400).json({ error: OTP_EXPIRING_ERR })
            }

            const data = `${email}.${otp}.${expires}`;
            const isValid = otpService.verifyOTP(hashedOTP, data);

            if (!isValid) {
                return res.status(400).json({ error: WRONG_OTP_ERR });
            }


        } catch (err) {
            console.log(err);
            res.status(500).json({ message: SOMETHING_WENT_WRONG });
        }

        try {

            let user;
            user = await userService.findUser({ email });
            if (!user) {
                user = await userService.createUser({ email, verified: true });
            }

            return res.status(200).json({ message: "Email verified successfully", user: new UserDto(user) });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: DATABASE_ERR });
        }



    }


    async refresh(req, res) {
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        // Check token validity
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        } catch (err) {
            return res.status(401).json({ error: JWT_DECODE_ERR });
        }
        // Check availabilty of token in database
        try {
            const token = await tokenService.findRefreshToken(userData.userId, refreshTokenFromCookie);
            if (!token) {
                return res.status(401).json({ error: JWT_DECODE_ERR });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: SOMETHING_WENT_WRONG });
        }

        // Checking validity of user.
        const user = await UserModel.findOne({ _id: userData.userId });
        if (!user) {
            return res.status(404).json({ error: USER_NOT_FOUND_ERR });
        }

        // Generate new access and refresh tokens
        const accessToken = tokenService.generateAccessToken({ userId: user._id });
        const refreshToken = tokenService.generateRefreshToken({ userId: user._id });

        // Update Refresh Token
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: SOMETHING_WENT_WRONG });
        }

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        const userDto = new UserDto(user);
        res.json({ user: userDto });
    }

    async login(req, res) {
        try {
            const errors = validationService.checkValidation(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }


            const { usernameOrEmail, password } = req.body;

            const user = await UserModel.findOne({
                $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
            });

            if (!user) {
                return res.status(401).json({ message: INVALID_CREDENTIALS });
            }

            const isMatch = await hashService.validateHashedPassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: WRONG_PASSWORD });
            }


            if (!user.verified) {
                return res.status(403).json({ message: 'Email not verified' });
            }
            const { accessToken, refreshToken } = tokenService.generateTokens({ userId: user._id });



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
            res.send(userDto);

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: SOMETHING_WENT_WRONG });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // Check if the user exists
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: USER_NOT_FOUND_ERR });
            }

            // Generate a reset token and set the expiry date
            const resetToken = Math.random().toString(36).substring(7);
            const resetTokenExpiry = new Date();
            resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);


            // Update the user with the reset token and expiry date
            await user.updateOne({ resetToken, resetTokenExpiry });
            console.log(resetToken);
            // const mailOptions = {
            //     from: process.env.EMAIL_ADDRESS,
            //     to: email,
            //     subject: 'Reset your password',
            //     text: `Click on this link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`
            // };
            // await mailService.sendMail(mailOptions);

            res.status(200).json({ message: 'Reset link sent to your email' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: SOMETHING_WENT_WRONG });
        }
    }

    async resetPassword(req, res) {
        try {
            const { resetToken } = req.params;
            const { password } = req.body;

            // Find user with the provided reset token
            const user = await UserModel.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });

            console.log(resetToken, password);
            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            const hashedPassword = await hashService.hashPassword(password);
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();
            res.status(200).json({ message: 'Password reset successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: SOMETHING_WENT_WRONG });
        }
    }


    async passportAuthenticate(req, res) {
        try {
            console.log(req.user);
            console.log(req.user.emails[0].value);
            const existingUser = await UserModel.findOne({
                email: req.user.emails[0].value
            });

            if (!existingUser) {
                return res.status(404).json({ error: USER_NOT_FOUND_ERR });
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
            res.send(userDto);

        } catch (err) {
            console.log(err);
        }


    }

    async logout(req, res) {
        const { refreshToken } = req.cookies;

        await tokenService.removeToken(refreshToken);

        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({ user: null });
    }
}

module.exports = new AuthController();