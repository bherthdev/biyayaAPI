const allowedOrigins = {
     production: process.env.ALLOWED_ORIGIN_VERCEL_PRODUCTION,
     preview: process.env.ALLOWED_ORIGIN_VERCEL_PREVIEW,
     local3000: process.env.ALLOWED_ORIGIN_LOCAL3000,
     local5173: process.env.ALLOWED_ORIGIN_LOCAL5173,
     onRender: process.env.ALLOWED_ORIGIN_ONRENDER
 };
 
 module.exports = allowedOrigins;
 