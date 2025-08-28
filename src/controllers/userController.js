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
            role: reqBody.role,
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