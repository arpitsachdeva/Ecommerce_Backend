const mongoose = require('mongoose');

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
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: [{
        type: String,
    }],
    brand: {
        type: String,
    },
    imageUrl: {
        id: {
            type: String,
        },
        path: {
            type: String,
        },
        alt:{
            type: String,
        }
    },
    imageGallery: [{
        id: {
            type: String,
        },
        path: {
            type: String,
        },
        alt:{
            type: String,
        }
    }],
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
