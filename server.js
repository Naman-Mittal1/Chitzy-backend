require('dotenv').config();
const { HOST } = require('./config');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./passport');
// const passportSetup = require('./passport');
const authRoute = require('./routes/auth-route');
const session = require('express-session');
const dbConnect = require('./db/conn');

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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'bla bla bla'
}));

app.use(passport.initialize());
app.use(passport.session());


app.use('/api/auth', authRoute);


server.listen(PORT, HOST, function(err) {
    if (err) return console.log(err);
    console.log(`Listening on http://${HOST}:${PORT}`);
});