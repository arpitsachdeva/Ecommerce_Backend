const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    path: { type: String, required: true },
    // _id will be automatically generated
});

const imagesSchema = new mongoose.Schema({
    images: [imageSchema]
})



const Image = mongoose.model("Image", imagesSchema);
module.exports = Image;