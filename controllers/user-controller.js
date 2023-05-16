const UserDto = require("../dtos/user-dto");
const { SOMETHING_WENT_WRONG, USER_NOT_FOUND_ERR } = require("../errors");
const UserModel = require("../models/user-model");
const validationService = require("../services/validation-service");

class ProfileController {
    async getProfile(req, res) {
        try {
            const userId = req.userId;
            const user = await UserModel.findById(`${userId}`).select('-createdAt -updatedAt -__v -password -_id');
            res.json({ user });

        } catch (err) {
            console.log(err);
            res.status(200).json({ error: SOMETHING_WENT_WRONG });
        }
    }

    async updateProfile(req, res) {
        const { type, value } = req.body;
        try {
            const errors = validationService.checkValidation(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            const userId = req.userId;
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: USER_NOT_FOUND_ERR });
            }

            user[type] = value;
            const updatedUser = await user.save();

            res.json({ message: `${type} updated successfully`, user: new UserDto(updatedUser) });

        } catch (err) {
            console.log(err);
            res.status(200).json({ error: `Unable to update ${type}` });
        }
    }

    async searchUser(req, res) {
        try {
            const { query } = req.query;

            const users = await UserModel.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            });

            res.status(200).json({ users });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Failed to search users' });
        }
    }

}

module.exports = new ProfileController();