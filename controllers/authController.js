const User = require('../models/User')
const Log = require('../models/Log')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const { username, password } = req.body

    

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Unauthorized' })

    const trueValues = {};

  // Iterate over req.useragent and filter properties with true value
  for (const [key, value] of Object.entries(req.useragent)) {
    if (value === true) {
      trueValues[key] = value;
    }
  }
    const device = req.useragent.isMobile ? 'Mobile' : req.useragent.isTablet ? 'Tablet' : 'Desktop';
    const browser = req.useragent.browser;
    const os = req.useragent.os;
    const platform = req.useragent.platform;

    const userLogs = {
        name:  foundUser.name,
        date:  new Date().toLocaleDateString("en-US", {year:'numeric' , day: 'numeric' , month: 'short' }) + ", " + new Date().toLocaleTimeString(),
        avatar: foundUser.avatar,
        deviceInfo: {
            device: device,
            browser: browser,
            os: os,
            platform: platform,
            other: trueValues,
        }
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "id": foundUser._id,
                "name": foundUser.name,
                "username": foundUser.username,
                "position": foundUser.position,
                "roles": foundUser.roles,
                "avatar": foundUser.avatar,
                "biyaya_secret": process.env.BIYAYA_ADMIN_SECRET,
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server 
        secure: true, //https
        sameSite: 'None', //cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    const log = await Log.create(userLogs)

    if(log){
        console.log('user log created!')
    }else{
        console.log('user log error!')
    }

    // Send accessToken containing username and roles 
    res.json({ accessToken })
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "id": foundUser._id,
                        "name": foundUser.name,
                        "username": foundUser.username,
                        "position": foundUser.position,
                        "roles": foundUser.roles,
                        "avatar": foundUser.avatar,
                        "biyaya_secret": process.env.BIYAYA_ADMIN_SECRET,
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        }
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}