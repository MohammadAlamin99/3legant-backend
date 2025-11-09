const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const cloudinary = require("../config/cloudinary");

// Registration

exports.userRegistration = async (req, res) => {
  try {
    const hashPasword = await bcrypt.hash(req.body.password, 10);
    let reqBody = req.body;
    reqBody.password = hashPasword;
    const newUser = await userModel.create(reqBody);
    let payload = {
      userId: newUser._id,
      email: reqBody.email,
      role: "customer",
    };
    let token = jwt.sign(payload, process.env.secret_key);
    return res.status(201).json({
      status: "success",
      message: "User registation successful",
      token: token,
    });
  } catch (e) {
    if (e.code === 11000 && e.keyPattern && e.keyPattern.email) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists.",
      });
    }
    return res.status(500).json({
      status: "fail",
      message: e,
    });
  }
};

// login

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Email does not exist.",
      });
    }
    const ispasswordMatch = await bcrypt.compare(password, user.password);

    if (!ispasswordMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Password is incorrect.",
      });
    }

    const payload = {
      email: user.email,
      role: user.role,
      userId: user._id,
    };
    const token = jwt.sign(payload, process.env.secret_key);
    return res.status(200).json({
      status: "success",
      message: "login successful",
      token: token,
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e,
    });
  }
};

// get user profile
exports.userProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await userModel
      .findOne({ email: email })
      .select("-password -_id -__v -createdAt -updatedAt");
    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e,
    });
  }
};

// update profile

exports.updateUserProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const reqBody = req.body;
    if (reqBody.email) {
      return res.status(400).json({
        status: "fail",
        message: "Email cannot be updated",
      });
    }
    if (reqBody.role) {
      return res.status(400).json({
        status: "fail",
        message: "Role cannot be updated",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (reqBody.oldPassword && reqBody.password) {
      const isMatch = await bcrypt.compare(reqBody.oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: "fail",
          message: "Old password is incorrect",
        });
      }
      reqBody.password = await bcrypt.hash(reqBody.password, 10);
      delete reqBody.oldPassword;
    } else if (reqBody.password && !reqBody.oldPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Old password is required to set a new password",
      });
    }

    if (req.file) {
      const fileBuffer = req.file.buffer.toString("base64");
      const uploaded = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${fileBuffer}`,
        { folder: "user_profiles" }
      );
      reqBody.photo = uploaded.secure_url;
    }
    await userModel.updateOne({ email }, { $set: reqBody });

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message || e,
    });
  }
};
