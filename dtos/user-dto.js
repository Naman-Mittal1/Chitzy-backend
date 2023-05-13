const { BASE_URL } = require('../config');

class UserDto {
    _id;
    name;
    username;
    phone;
    email;
    profilePic;
    activated;
    verified;
    createdAt;

    constructor(user) {
        this._id = user._id;
        this.name = user.name;
        this.username = user.username.toLowerCase();
        this.phone = user.phone;
        this.email = user.email;
        this.profilePic = user.profilePic;
        this.activated = user.activated;
        this.verified = user.verified;
        this.createdAt = user.createdAt;
    }

}

module.exports = UserDto;