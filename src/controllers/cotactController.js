const contactModel = require("../models/contactModel");

// create contact
exports.createContact = async (req, res) => {
    try {
        const reqBody = req.body;
        await contactModel.create(reqBody);
        res.status(200).json({
            status: "success",
            message: "contact created successfully",
        })
    } catch (e) {
        res.status(400).json({
            status: "fail",
            message: e.message,
        })
    }
}


// get contacts
exports.getContacts = async (req, res) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        const contacts = await contactModel.find().skip(skip).limit(limit);
        res.status(200).json({
            status: "success",
            data: contacts,
        })
    } catch (e) {
        res.status(400).json({
            status: "fail",
            message: e.message,
        })
    }
}