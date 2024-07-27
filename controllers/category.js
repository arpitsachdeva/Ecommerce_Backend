const Category = require("../models/category");
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
    const slugName = slugify(file.name, {remove: /[*+~.()'"!:@]/g})
    const fileName = slugName;
    let filePath;
    if (flag === 0){
        filePath = path.join(__dirname, '../public/productFiles/image', fileName); // path of server
    } else {
        filePath = path.join(__dirname, '../public/productFiles/imageGallery', fileName); // path of server
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

//Async funtion to add category
exports.addCategory = async (req,res) => {
    try{
        const {title, parent_id, description, metaTitle,
            metaDec, meta_keywords, isIndexed, status, isDeleted} = req.body;
        
        console.log("req bodyy", req.body)
        console.log("Start");

        const slug = await generateSlug(title, Category);
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
        const categoryData = await Category.create({
            title,slug,parent_id,
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
        console.log("Category data", categoryData);

        return res.status(200).json({
            success: true,
            status:200,
            data: categoryData,
            message:"Category created successfully",
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

// Async function to update category
exports.updateCategory = async (req, res) => {
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

        // Find the existing category
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
                status: 404,
            });
        }

        let slug = existingCategory.slug;
        if (title) {
            slug = await generateSlug(title, Category);
        }

        let imageUrl = existingCategory.image;
        if (req.files && req.files.imageFile) {
            if (existingCategory.image && existingCategory.image.path) {
                fs.unlinkSync(existingCategory.image.path); // Delete the old image
            }

            const image = req.files.imageFile;
            const flag = 0;
            const imageFilePath = await uploadFileToServer(image, flag);
            imageUrl = {
                path: imageFilePath,
                alt: slug,
            };
        }

        let imageGallery = existingCategory.imageGallery;
        if (req.files && req.files.imageGallery) {
            if (existingCategory.imageGallery && existingCategory.imageGallery.length > 0) {
                existingCategory.imageGallery.forEach(image => {
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

        const updatedCategory = await Category.findByIdAndUpdate(id, {
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
            data: updatedCategory,
            message: "Category updated successfully",
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

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the category by ID
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
                status: 404,
            });
        }

        // Delete associated images from the server
        if (category.image && category.image.path) {
            fs.unlink(category.image.path, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${category.image.path}`);
                }
            });
        }

        if (category.imageGallery && category.imageGallery.length > 0) {
            category.imageGallery.forEach(image => {
                fs.unlink(image.path, (err) => {
                    if (err) {
                        console.error(`Failed to delete gallery image file: ${image.path}`);
                    }
                });
            });
        }

        // Delete the category from the database
        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            status: 200,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the category",
            status: 500,
        });
    }
};


exports.softDeleteCategory = async (req,res) => {
    try{

        const {id} = req.params;

        const existingCategory = Category.findById(id);

        if(!existingCategory){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No such Category exists"
            })
        }

        existingCategory.isDeleted = true;

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category deleted successfully",
        })

    }catch(error){

        return res.status(400).json({
            success: false,
            status: 400,
            message: "Something went wrong",
        })

    }
}
//GET List of Categories

exports.getAllCategories = async (req,res) => {
    try{
        const searchName = req.query.name || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const nameRegex = new RegExp(searchName , 'i');

        const query = {
            'title' : {$regex: nameRegex}
        };

        const data = await Category.find(query);
        console.log("Data for category", data);
        if(!data) {
            res.status(404).json({
                success: false,
                status: 404,
                message: "No category found"
            })
        }

        const total = data.length;
        const totalPages = Math.ceil(total / limit);

        if(page > totalPages){
            return res.status(404).json({
                message: "Page not found",
            })
        }

        const categories = await Category.find(query).skip(startIndex).limit(limit).exec(); //Filters can also be applied later

        res.status(200).json({
            success: true,
            status : 200,
            message: "Categories found",
            page,
            perPage: limit,
            totalPages: totalPages,
            data: categories,

        })
        
    }catch(error){

        res.status(400).json({
            success : false,
            message : "Something went wrong"
        });

    }
}

//GET CATEGORY BY ID

exports.getCategoryById = async (req,res) => {
    try{

        const {id} = req.params;
        const category = await Category.findById(id);
        if(!category){
            return res.status(404).json({
                success: false,
                status: 404,
                message:"Category not found",
            })
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category found",
            data: category,
        })

    }catch(error){
        res.status(400).json({
            success : false,
            message : "Something went wrong"
        })
    }
}