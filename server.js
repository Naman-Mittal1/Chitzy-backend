require('dotenv').config();
const { HOST, OAUTH_CLIENT_ID, BASE_URL, OAUTH_CLIENT_SECRET } = require('./config');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require("axios");
const passport = require('./passport');
const authRoute = require('./routes/auth-route');
const session = require('express-session');
const dbConnect = require('./db/conn');


// Temp imports
const UserModel = require('./models/user-model');

const querystring = require('querystring');
const { USER_NOT_FOUND_ERR } = require('./errors');
const tokenService = require('./services/token-service');
const UserDto = require('./dtos/user-dto');

const server = require('http').createServer(app);
const PORT = process.env.PORT || 8000;
dbConnect();

const corsOptions = {
    credentials: true,
    origin: [process.env.CLIENT_URL],
};
app.use(cookieParser());

const redirectURI = "auth/google";

function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    // const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: `${BASE_URL}/${redirectURI}`,
        client_id: OAUTH_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
}

// console.log(getGoogleAuthURL());

app.use(cors(corsOptions));
app.get("/", (req, res) => {
    res.send("Hello");
});

app.get('/auth/google/url', (req, res) => {
    return res.send(getGoogleAuthURL());
});


function getTokens({ code, clientId, clientSecret, redirectUri }) {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    };

    return axios
        .post(url, querystring.stringify(values), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            console.error("Failed to fetch auth tokens");
            throw new Error(error.message);
        });
}

app.get(`/${redirectURI}`, async(req, res) => {
    const code = req.query.code;

    const { id_token, access_token } = await getTokens({
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

    // const token = jwt.sign(googleUser, JWT_SECRET);

    // res.cookie(COOKIE_NAME, token, {
    //     maxAge: 900000,
    //     httpOnly: true,
    //     secure: false,
    // });

    console.log(googleUser);


    const existingUser = await UserModel.findOne({
        email: googleUser.email
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
    res.redirect(process.env.CLIENT_URL);

});


app.get("/auth/me", async(req, res) => {
    console.log("get me");
    try {
        //   const decoded = jwt.verify(req.cookies[COOKIE_NAME], JWT_SECRET);
        const decoded = await tokenService.verifyAccessToken(req.cookies['accessToken']);
        console.log("decoded", decoded);
        return res.send(decoded);
    } catch (err) {
        console.log(err);
        res.send(null);
    }
});

app.get('/auth/logout', async(req, res) => {
    const { refreshToken } = req.cookies;

    await tokenService.removeToken(refreshToken);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ user: null });
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(session({
//     resave: false,
//     saveUninitialized: false,
//     secret: 'bla bla bla'
// }));

// app.use(passport.initialize());
// app.use(passport.session());


app.use('/api/auth', authRoute);


server.listen(PORT, HOST, function(err) {
    if (err) return console.log(err);
    console.log(`Listening on http://${HOST}:${PORT}`);
});