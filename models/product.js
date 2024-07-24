const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    path: { type: String, required: true },
    alt: { type: String }
    // _id will be automatically generated
  });
  

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    shortdec: {
        type: String,
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        default: 0,
    },
    category: [{
        type: String,
    }],
    brand: {
        type: String,
    },
    imageUrl: ImageSchema,
    imageGallery: [ImageSchema],
    metaTitle: {
        type: String,
    },
    metaDec: {
        type: String,
    },
    isIndexed: {
        type: Boolean,
        default: true,
    },
    isStock: {
        type: Boolean,
        default: false,
    },
    isFeature: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
