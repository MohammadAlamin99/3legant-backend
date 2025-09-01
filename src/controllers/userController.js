const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const userModel = require("../models/userModel");

// Registration
exports.userRegistration = async (req, res) => {
    try {
        const hashPasword = await bcrypt.hash(req.body.password, 10);
        let reqBody = req.body;
        reqBody.password = hashPasword;
        let payload = {
            email: reqBody.email,
            role: "customer",
        }
        let token = jwt.sign(payload, process.env.secret_key);
        await userModel.create(reqBody);
        return res.status(201).json({
            status: "success",
            message: "User registation successful",
            token: token,
        })
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
        })
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
            })
        }
        const ispasswordMatch = await bcrypt.compare(password, user.password);

        if (!ispasswordMatch) {
            return res.status(400).json({
                status: "fail",
                message: "Password is incorrect."
            })
        }

        const payload = {
            email: user.email,
            role: user.role,
        }
        const token = jwt.sign(payload, process.env.secret_key);
        return res.status(200).json({
            status: "success",
            message: "login successful",
            token: token,
        })

    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e,
        })
    }
}

// get user profile
exports.userProfile = async (req, res) => {
    try {
        const email = req.user.email;
        const user = await userModel.findOne({ email: email }).select("-password -_id -__v -createdAt -updatedAt");
        return res.status(200).json({
            status: "success",
            data: user,
        })
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e,
        })
    }
}


// update profile
exports.updateUserProfile = async (req, res) => {
    try {
        const email = req.user.email;
        const reqBody = req.body;
        if (reqBody.email) {
            return res.status(400).json({
                status: "fail",
                message: "Email can not be updated",
            })
        }
        if (reqBody.role) {
            return res.status(400).json({
                status: "fail",
                message: "Role can not be updated",
            })
        }
        if (reqBody.password) {
            reqBody.password = await bcrypt.hash(reqBody.password, 10);
        }
        await userModel.updateOne(
            { email: email },
            { $set: reqBody },
        )
        return res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
        })

    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e,
        })
    }
}