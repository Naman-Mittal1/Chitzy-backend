const passport = require('passport');
const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = require('./config');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('./models/user-model');

passport.use(new GoogleStrategy({
    clientID: OAUTH_CLIENT_ID,
    clientSecret: OAUTH_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ["profile", "email"]

}, async(accessToken, refreshToken, profile, done) => {
    done(null, profile);
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    const user = await UserModel.findById(id);
    done(null, user);
});


module.exports = passport;