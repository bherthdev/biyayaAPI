const allowedOrigins = [
     process.env.ALLOWED_ORIGIN_VERCEL_PRODUCTION,
     process.env.ALLOWED_ORIGIN_VERCEL_PREVIEW,
     process.env.ALLOWED_ORIGIN_LOCAL3000,
     process.env.ALLOWED_ORIGIN_LOCAL5173,
     process.env.ALLOWED_ORIGIN_ONRENDER,
]

module.exports = allowedOrigins
