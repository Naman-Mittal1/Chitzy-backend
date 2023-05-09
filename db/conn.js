const { DB_URL } = require('../config');
const mongoose = require('mongoose');

function dbConnect() {
    mongoose.connect(DB_URL);

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    db.once('open', () => {
        console.log('DB CONNECTED...');
    });
}

module.exports = dbConnect;