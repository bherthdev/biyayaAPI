const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const cloudinary = require("../utils/cloudinary");
const docsController = require("../utils/cloudinaryController")

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find().select("-password").lean();

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
  const { name, position, username, password, roles, image } = req.body;

  // console.log(req.body)

  // Confirm data
  if (!name || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const result = await cloudinary.uploader.upload(image);

  const userObject = {
    name,
    position,
    username,
    password: hashedPwd,
    roles,
    dev: false,
    avatar: result.secure_url,
    cloudinary_id: result.public_id
  }
  // Create and store new user
  const user = await User.create(userObject);
  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} successfully created.` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, name, position, username, roles, active, password, image } = req.body;


  // Confirm data
  if (!id || !name || !username || !roles) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  let result;
  if (image) {
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(user.cloudinary_id);
    // Upload image to cloudinary
    result = await cloudinary.uploader.upload(image);
  }

  user.name = name;
  user.position = position;
  user.username = username;
  user.roles = roles;
  user.dev =  user?.dev,
  user.active = active;
  user.avatar = result?.secure_url || user.avatar;
  user.cloudinary_id = result?.public_id || user.cloudinary_id;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.name} successfully updated.` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Delete image avatar from cloudinary
  await cloudinary.uploader.destroy(user.cloudinary_id);
 

  const result = await user.deleteOne();


  const reply = `${user.name} successfully deleted.`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
