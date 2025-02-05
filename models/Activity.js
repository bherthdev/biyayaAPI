const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
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
    actionType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    orderID: {
      type: String,
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

module.exports = mongoose.model("Activity", activitySchema);
