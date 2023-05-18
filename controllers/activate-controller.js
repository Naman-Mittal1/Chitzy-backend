const { USER_ALREADY_EXISTS } = require("../constant");
const UserDto = require("../dtos/user-dto");
const { IMAGE_PROCESSING_ERR, SOMETHING_WENT_WRONG } = require("../errors");
const UserModel = require("../models/user-model");
const hashService = require("../services/hash-service");
const jimp = require('jimp');
const path = require('path');
const imageService = require("../services/image-service");
const tokenService = require("../services/token-service");
class ActivateController {
    async activate(req, res) {
        try {
            // const errors = valida.checkValidation(req);
            // if (!errors.isEmpty()) {
            //     return res.status(422).json({ errors: errors.array() });
            // }

            const { name, email, phone, password, username, profilePic } = req.body;



            let user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(409).json({ message: USER_ALREADY_EXISTS });
            }

            const usernameCheck = await UserModel.findOne({
                ['username']: username
            }).lean();

            if (usernameCheck !== null) {
                return res.status(403).json(`${username} is not available`);
            }

            const hashedPassword = await hashService.hashPassword(password);

            if (profilePic !== "") {
                const profilePicBase64 = await imageService.convertBlobUrlToBase64(profilePic);
                const buffer = Buffer.from(profilePicBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
                const imagePath = `${Date.now()}.${Math.round(Math.random() * 1e9)}.png`;
                try {
                    const jimpResp = await jimp.read(buffer);
                    jimpResp.resize(150, jimp.AUTO).write(path.resolve(__dirname, `../storage/${imagePath}`));
                } catch (err) {
                    console.log(err);
                    res.status(500).json({ error: IMAGE_PROCESSING_ERR });
                }
            }



            user.name = name;
            user.phone = phone ? phone : "";
            user.password = hashedPassword;
            user.username = username;
            user.activated = true;
            // user.profilePic = ``;
            user.profilePic = profilePic === "" ? "" : `/storage/${imagePath}`;

            await user.save();

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
            res.json({ user: userDto, auth: true, message: "User registered successfully" });


        } catch (err) {
            console.log(err);
            res.status(500).json({ message: SOMETHING_WENT_WRONG });
        }




    }

}

module.exports = new ActivateController();