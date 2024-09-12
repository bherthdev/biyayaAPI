const allowedOrigins = require('./allowedOrigins');
const connectDB = require('./dbConn');

const corsOptions = {
    origin: (origin, callback) => {
        if (origin === allowedOrigins.production) {
            connectDB(allowedOrigins.production); // Connect to production DB
        } else if (origin === allowedOrigins.preview) {
            connectDB(allowedOrigins.preview); // Connect to preview DB
        }

        if (Object.values(allowedOrigins).includes(origin) || !origin) {
            callback(null, true); // Allow origin
        } else {
            callback(new Error('Not allowed by CORS')); // Block origin
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = corsOptions;
