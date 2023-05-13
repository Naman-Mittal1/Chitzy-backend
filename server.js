require('dotenv').config();
const { HOST, OAUTH_CLIENT_ID, BASE_URL, OAUTH_CLIENT_SECRET } = require('./config');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth-route');
const activateRoute = require('./routes/activate-route');
const oauthRouter = require('./routes/oauth-route');
const conversationRoute = require('./routes/conversation-route');
const messageRoute = require('./routes/message-route');
const dbConnect = require('./db/conn');


const tokenService = require('./services/token-service');

const server = require('http').createServer(app);
const PORT = process.env.PORT || 8000;
dbConnect();

const corsOptions = {
    credentials: true,
    origin: [process.env.CLIENT_URL],
};
app.use(cookieParser());


app.use(cors(corsOptions));
app.get("/", (req, res) => {
    res.send("Hello");
});



app.get('/auth/logout', async(req, res) => {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    await tokenService.removeToken(refreshToken);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ user: null });
});

app.use('/storage', express.static('storage'));


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoute);
app.use('/api/activate', activateRoute);
app.use(oauthRouter);
app.use('/api/conversation', conversationRoute);
app.use('/api/message', messageRoute);


server.listen(PORT, HOST, function(err) {
    if (err) return console.log(err);
    console.log(`Listening on http://${HOST}:${PORT}`);
});