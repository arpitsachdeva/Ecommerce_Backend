const Brand = require("../models/brand");
const fs = require('fs');
const path = require('path');
const { v4: uuid4} = require('uuid');
const generateSlug = require('./slugGenerator');
const { isIn } = require("validator");
const slugify = require("slugify");
//Generate slug

// Generate slug and ensure its uniqueness


//For uploading image to the server
async function uploadFileToServer(file, flag) {
    const slugName = slugify(file.name, {remove: /[*+~()'"!:@]/g});
    const fileName = slugName;
    let filePath;
    if (flag === 0){
        filePath = path.join(__dirname, '../public/images/brand', fileName); // path of server
    } else {
        filePath = path.join(__dirname, '../public/imageGallery/brand', fileName); // path of server
    }

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
    const flag = 1;
    const uploads = files.map(file => uploadFileToServer(file, flag));
    return await Promise.all(uploads);
}

//Async funtion to add brand
exports.addBrand = async (req,res) => {
    try{
        const {title, parent_id, description, metaTitle,
            metaDec, meta_keywords, isIndexed, status, isDeleted} = req.body;
        
        console.log("req bodyy", req.body)
        console.log("Start");

        const slug = await generateSlug(title, Brand);
        console.log("Slug : ", slug);

        //Check for image file in request

        let imageUrl = null;
        console.log(imageUrl);
        if(req.files && req.files.imageFile){
            console.log("Into the if statement")
            const image = req.files.imageFile;
            console.log("Image", image);

            //upload image to server
            const flag = 0;
            const imageFilePath = await uploadFileToServer(image, flag);
            console.log("Image file path:", imageFilePath);

            //create data object with id and path
            imageUrl = {
                path: imageFilePath,
                alt: slug ,
            };
            console.log("Image url", imageUrl)
        }
        console.log("imageUrl",imageUrl);

        //check for image gallery in request

        let imageGallery =[];
        if(req.files && req.files.imageGallery) {
            const galleryImages = req.files.imageGallery;
            const galleryFilePaths = await uploadFilesToServer(Array.isArray(galleryImages)? galleryImages : [galleryImages]);
            console.log("Image gallery file paths", galleryFilePaths);

            imageGallery = galleryFilePaths.map(filePath => ({
                path: filePath,
                alt: slug,
            }));
        }

        console.log("Image gallery", imageGallery)
        console.log("out of the loop")

        //Saving entry in database
        const brandData = await Brand.create({
            title,
            slug,
            parent_id,
            description,
            metaTitle: title,
            metaDec :description,
            meta_keywords,
            isIndexed,
            status,
            isDeleted,
            image: imageUrl,
            imageGallery
        });
        console.log("Brand data", brandData);

        return res.status(200).json({
            success: true,
            status:200,
            data: brandData,
            message:"Brand created successfully",
        })

    }catch(error){
        return res.status(400).json({
            success: false,
            status: 400,
            message:"Something went wrong",
        })
    }
} 


// For deleting a single image from the server
function deleteFileFromServer(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

// For deleting multiple images from the server
async function deleteFilesFromServer(filePaths) {
    const deletePromises = filePaths.map(filePath => deleteFileFromServer(filePath));
    return Promise.all(deletePromises);
}

// Async function to update Brand
exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            parent_id,
            description,
            metaTitle,
            metaDec,
            meta_keywords,
            isIndexed,
            status,
            isDeleted
        } = req.body;

        // Find the existing Brand
        const existingBrand = await Brand.findById(id);
        if (!existingBrand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found",
                status: 404,
            });
        }

        let slug = existingBrand.slug;
        // if (title) {
        //     slug = await generateSlug(title, Brand);
        // }

        let imageUrl = existingBrand.image;
        if (req.files && req.files.imageFile) {
            if (existingBrand.image && existingBrand.image.path) {
                fs.unlinkSync(existingBrand.image.path); // Delete the old image
            }

            const image = req.files.imageFile;
            const flag = 0;
            const imageFilePath = await uploadFileToServer(image, flag);
            imageUrl = {
                path: imageFilePath,
                alt: slug,
            };
        }

        let imageGallery = existingBrand.imageGallery;
        if (req.files && req.files.imageGallery) {
            if (existingBrand.imageGallery && existingBrand.imageGallery.length > 0) {
                existingBrand.imageGallery.forEach(image => {
                    fs.unlinkSync(image.path); // Delete the old gallery images
                });
            }

            const galleryImages = req.files.imageGallery;
            const galleryFilePaths = await uploadFilesToServer(Array.isArray(galleryImages) ? galleryImages : [galleryImages]);
            imageGallery = galleryFilePaths.map(filePath => ({
                path: filePath,
                alt: slug,
            }));
        }

        const updatedBrand = await Brand.findByIdAndUpdate(id, {
            title,
            slug,
            parent_id,
            description,
            metaTitle,
            metaDec,
            meta_keywords,
            isIndexed,
            status,
            isDeleted,
            image: imageUrl,
            imageGallery
        }, { new: true });

        return res.status(200).json({
            success: true,
            status: 200,
            data: updatedBrand,
            message: "Brand updated successfully",
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


// Permanent delete
exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the Brand by ID
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found",
                status: 404,
            });
        }

        // Delete associated images from the server
        if (brand.image && brand.image.path) {
            fs.unlink(brand.image.path, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${Brand.image.path}`);
                }
            });
        }

        if (brand.imageGallery && brand.imageGallery.length > 0) {
            brand.imageGallery.forEach(image => {
                fs.unlink(image.path, (err) => {
                    if (err) {
                        console.error(`Failed to delete gallery image file: ${image.path}`);
                    }
                });
            });
        }

        // Delete the Brand from the database
        await Brand.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Brand deleted successfully",
            status: 200,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the Brand",
            status: 500,
        });
    }
};

// Soft Delete
exports.softDeleteBrand = async (req,res) => {
    try{

        const {id} = req.params;

        const existingBrand = Brand.findById(id);

        if(!existingBrand){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No such Brand exists"
            })
        }

        const isDeleted = true;

        const updatedBrand = await Brand.findByIdAndUpdate(id, {
            isDeleted
        }, { new: true });


        return res.status(200).json({
            success: true,
            status: 200,
            message: "Brand deleted successfully",
        })

    }catch(error){

        return res.status(400).json({
            success: false,
            status: 400,
            message: "Something went wrong",
        })

    }
}
//GET List of Brands

exports.getAllBrands = async (req,res) => {
    try{
        const searchName = req.query.name || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const nameRegex = new RegExp(searchName , 'i');

        const query = {
            'title' : {$regex: nameRegex}
        };

        const data = await Brand.find(query);
        console.log("Data for Brand", data);
        if(!data) {
            res.status(404).json({
                success: false,
                status: 404,
                message: "No Brand found"
            })
        }

        const total = data.length;
        const totalPages = Math.ceil(total / limit);

        if(page > totalPages){
            return res.status(404).json({
                message: "Page not found",
            })
        }

        const Brands = await Brand.find(query).skip(startIndex).limit(limit).exec(); //Filters can also be applied later

        res.status(200).json({
            success: true,
            status : 200,
            message: "Brands found",
            page,
            perPage: limit,
            totalPages: totalPages,
            data: Brands,

        })
        
    }catch(error){

        res.status(400).json({
            success : false,
            message : "Something went wrong"
        });

    }
}

//GET Brand BY ID

exports.getBrandById = async (req,res) => {
    try{

        const {id} = req.params;
        const brand = await Brand.findById(id);
        if(!brand || brand.isDeleted === true){
            return res.status(404).json({
                success: false,
                status: 404,
                message:"Brand not found",
            })
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Brand found",
            data: brand,
        })

    }catch(error){
        res.status(400).json({
            success : false,
            message : "Something went wrong"
        })
    }
}