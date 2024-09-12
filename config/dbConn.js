const mongoose = require('mongoose');
const allowedOrigins = require('./allowedOrigins');

const connectDB = async (origin) => {
    try {
        let dbUri;
        if (origin === allowedOrigins.production) {
            dbUri = process.env.DATABASE_URI_PRODUCTION;
        } else if (origin === allowedOrigins.preview) {
            dbUri = process.env.DATABASE_URI_PREVIEW;
        } else {
            dbUri = process.env.DATABASE_URI_DEV; // Default for dev/local
        }

        mongoose.set("strictQuery", false);
        await mongoose.connect(dbUri);
        console.log(`Connected to database: ${dbUri}`);
    } catch (err) {
        console.error(err);
    }
};

module.exports = connectDB;
