const path = require('path');
const Image = require('../models/images');
const fs = require('fs');
const slugify = require("slugify");

//For uploading image to the server
async function uploadFileToServer(file) {
    const slugName = slugify(file.name, {remove: /[*+~.()'"!:@]/g})
    const fileName = slugName; // Use original file name
    let filePath;
    filePath = path.join(__dirname, '../public/images', fileName); // path of server

    console.log("PATH -> ", filePath);

    // Use a promise to handle asynchronous file move
    return new Promise((resolve, reject) => {
        file.mv(filePath, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(filePath);
        });
    });
}

// Function for uploading image gallery to server
async function uploadFilesToServer(files) {
    if (!files || !Array.isArray(files)) {
        return []; // Return an empty array if no files are provided
    }
    const uploads = files.map(file => uploadFileToServer(file));
    return await Promise.all(uploads);
}

exports.imageUploader = async (req,res) => {
    try{
      
        let imageGallery = [];
        if(req.files && req.files.imageGallery) {
            const galleryImages = req.files.imageGallery;
            const galleryFilePaths = await uploadFilesToServer(Array.isArray(galleryImages)? galleryImages : [galleryImages]);

            console.log("Image gallery file paths:", galleryFilePaths);

            imageGallery = galleryFilePaths.map(filePath => ({
                path: filePath,
                
            }));

        }
        
        const imagesData = await Image.create({
            images : imageGallery,
        })

        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            status: 200,
            data: imageGallery
        })
    }
    catch{
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Something went wrong",
            data: [],
        })
    }
}

// Controller to add more images to an existing record
exports.updateImageGallery = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the existing image record by ID
        const existingImageRecord = await Image.findById(id);
        if (!existingImageRecord) {
            return res.status(404).json({
                success: false,
                message: "Image record not found",
                status: 404,
            });
        }

        // Upload new images and get their paths
        let newImageGallery = [];
        if (req.files && req.files.imageGallery) {
            const galleryImages = req.files.imageGallery;
            const galleryFilePaths = await uploadFilesToServer(Array.isArray(galleryImages) ? galleryImages : [galleryImages]);

            newImageGallery = galleryFilePaths.map(filePath => ({
                path: filePath,
            }));
        }

        // Append new images to the existing image gallery array
        existingImageRecord.images.push(...newImageGallery);

        // Save the updated record to the database
        await existingImageRecord.save();

        return res.status(200).json({
            success: true,
            message: "Image gallery updated successfully",
            status: 200,
            data: existingImageRecord,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Something went wrong",
        });
    }
};