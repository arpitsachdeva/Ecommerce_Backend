const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    path: { type: String, required: true },
    alt: { type: String },
    // _id will be automatically generated
});
 

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    parent_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
    ,
    slug: {
        type: String,
        unique: true,
    },
    image:ImageSchema,
    imageGallery: [ImageSchema],
    description: {
        type: String,
        default:null,
    },
    metaTitle: {
        type: String,
        default:null,
    },
    metaDec: {
        type: String,
        default:null,
    },
    meta_keywords:[{
        type:String,
        default:null,
    }],
    isIndexed: {
        type: Boolean,
        default: true,
    },
    status: {
        type:String,
        default: "active",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
    isDeleted:{
        type: Boolean,
        default: false,
    }
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;