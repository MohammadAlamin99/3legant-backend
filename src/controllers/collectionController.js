const cloudinary = require("../config/cloudinary");
const collectionModel = require("../models/collectionModel")


// create collection 
exports.createCollection = async (req, res) => {
    try {
        const reqBody = req.body;
        const role = req.user.role;
        if (role !== "admin") {
            return res.status(403).json({
                status: "fail",
                message: "Acess forbidden"
            })
        }
        if (req.file) {
            const fileBase64 = req.file.buffer.toString("base64");
            const uploadResult = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${fileBase64}`,
                { folder: "collections" }
            );
            reqBody.image = uploadResult.secure_url;
        }
        const collection = await collectionModel.create(reqBody);
        return res.status(201).json({
            status: "success",
            message: "Collection created succcessfully",
            data: collection,
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: "fail",
            message: e
        })
    }
}

// get all collections
exports.getCollections = async (req, res) => {
    try {
        const section = req.query.section;
        const filter = { isActive: true };
        if (section) {
            filter.section = section.trim();
        }
        const collections = await collectionModel.find(filter);
        return res.status(200).json({
            status: "success",
            data: collections,
        })
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: "something went wrong",
        })
    }
}

// update collection by id

exports.updateCollection = async (req, res) => {
    try {
        const id = req.params.id;
        const userRole = req.user.role;
        const reqBody = req.body;
        if (userRole !== "admin") {
            return res.status(403).json({
                status: "fail",
                message: "Access forbidden",
            })
        }
        if (req.file && req.file.buffer) {
            const fileBase64 = req.file.buffer.toString("base64");
            const uploadResult = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${fileBase64}`,
                { folder: "collections" }
            );
            reqBody.image = uploadResult.secure_url;
        }
        const result = await collectionModel.findByIdAndUpdate(id, reqBody, { new: true, runValidators: true, });
        return res.status(200).json({
            status: "success",
            message: "Collection updated successfully",
            data: result
        })
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: "something went wrong"
        })
    }
}

// delete collection by id
exports.deleteCollection = async (req, res) => {
    try {
        const id = req.params.id;
        const userRole = req.user.role;
        if (userRole !== "admin") {
            return res.status(403).json({
                status: "fail",
                message: "Access forbidden"
            })
        }
        await collectionModel.findByIdAndDelete(id);
        return res.status(200).json({
            status: "success",
            message: "Collection deleted successfully"
        })
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: "something went wrong"
        })
    }
}