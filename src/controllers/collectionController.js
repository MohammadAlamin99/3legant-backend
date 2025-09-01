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
        const collection = await collectionModel.create(reqBody);
        return res.status(201).json({
            status: "success",
            message: "Collection created succcessfully",
        })
    } catch (e) {
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
        if (userRole !== "admin") {
            return res.status(403).json({
                status: "fail",
                message: "Access forbidden",
            })
        }
        const reqBody = req.body;
        await collectionModel.findByIdAndUpdate(id, reqBody);
        return res.status(200).json({
            status: "success",
            message: "Collection updated successfully"
        })
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            messageL: "something went wrong"
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