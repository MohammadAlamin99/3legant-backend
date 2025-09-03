const blogModel = require("../models/blogModel");

// CREATE BLOG
exports.createBlog = async (req, res) => {
    try {
        const { title, content, author, category, tags, image, status } = req.body;
        if (!title || !content || !author) {
            return res.status(400).json({ message: "Title, Content, and Author are required" });
        }
        const newBlog = await blogModel.create({
            title,
            content,
            author,
            category,
            tags,
            image,
            status,
        });
        res.status(201).json({
            message: "Blog created successfully",
            blog: newBlog,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create blog",
            error: error.message,
        });
    }
};


// get all blogs
exports.getBlogs = async (req, res) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        const blogs = await blogModel.find({ status: "published" }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        res.status(200).json({
            status: "success",
            data: blogs,
        })
    } catch (e) {
        res.status(500).json({
            status: "fail",
            message: "something went wrong",
        })
    }
}

// delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogModel.findById(id);
        if (!blog) {
            return res.status(404).json({
                status: "fail",
                message: "blog not found",
            })
        }
        await blogModel.findByIdAndDelete(id);
        res.status(200).json({
            status: "success",
            message: "blog deleted successfully",
        })
    } catch (e) {
        res.status(500).json({
            status: "fail",
            message: "something went wrong",
        })
    }
}


// update blog
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const reqBody = req.body;
        await blogModel.findByIdAndUpdate(id, {
            ...reqBody
        });
        res.status(200).json({
            status: "success",
            message: "blog updated successfully",
        })
    } catch (e) {
        res.status(500).json({
            status: "fail",
            message: "something went wrong",
        })
    }
}