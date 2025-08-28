const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./src/routes/api')
require('dotenv').config()


// databse cennection
let URL = process.env.mongodbUrl;
let option = { user: process.env.user, pass: process.env.user, autoIndex: true }
mongoose.connect(URL, option).then(() => {
    console.log('Database connected...');
}).catch((err) => {
    console.log(err)
})


//  seccurity middleware implemantation
app.use(cors());
app.use(bodyParser.json());


// Routing Implement
app.use("/api/v1", router);
app.use("*", (req, res) => {
    res.status(404).json({ status: "fail", data: "Not Found Request" })
})

module.exports = app;