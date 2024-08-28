const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    deviceInfo: {
      device: String,
      browser: String,
      os: String,
      platform: String,
      other: {
        isAuthoritative: Boolean,
        isChrome: Boolean,
        isDesktop: Boolean,
        isWindows: Boolean,
      },
    },
    seen: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true
  }

);

module.exports = mongoose.model("Log", logSchema);
