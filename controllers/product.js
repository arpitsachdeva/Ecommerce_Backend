const Product = require("../models/product");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import UUID library
const generateSlug = require("./slugGenerator");
const slugify = require("slugify");
const Category = require('../models/category');
const Brand = require('../models/brand');
const mongoose = require('mongoose');

// For uploading image to server
async function uploadFileToServer(file, flag, slug) {
    let name = slug + file.name;
    console.log("Namename nameee", name);
    console.log("image file nameee", file.name);
    let slugName = slugify(name, {remove: /[*+~()'"!:@]/g , lower:true});
    const fileName = slugName ;
    let filePath;
    if (flag === 0) {
        filePath = path.join(__dirname, '../public/images/product', fileName); // path of server
    } else {
        filePath = path.join(__dirname, '../public/imageGallery/product', fileName); // path of server
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

// For uploading multiple images to server
async function uploadFilesToServer(files, slug) {
    if (!files || !Array.isArray(files)) {
        return []; // Return an empty array if no files are provided
    }
    const flag = 1;
    const uploads = files.map(file => uploadFileToServer(file, flag, slug));
    return await Promise.all(uploads);
}

// Async function to add product
exports.addProduct = async (req, res) => {
    try {
        const { title, shortdec, description, price, categories, brands, metaTitle, metaDec, isIndexed, isStock, isFeature, status, inStock, discountType, discountAmount} = req.body;

        console.log(title, shortdec, description, price, categories, brands, metaTitle, metaDec, isIndexed, isStock, isFeature, status,  inStock, discountType, discountAmount);

        const slug = await generateSlug(title, Product);
        console.log("Generated slug:", slug);

        if(!inStock){
            inStock = 1;
        }

        let netAmount;
        let discountPrice;

        if(discountType && discountType === "flat"){
            if(discountAmount){
                discountPrice = discountAmount;
                netAmount = price - discountAmount;
            }
        }
        else if(discountType && discountType === "percentage"){
            if(discountAmount){
                const discount = (price * discountAmount)/100;
                discountPrice = discount;
                netAmount = price - discount;
            }
        }

        // Check for imageFile in request
        let imageUrl = null;
        if (req.files && req.files.imageFile) {
            const image = req.files.imageFile;
            console.log("Image", image);

            // Upload image to server
            const flag = 0;
            const imageFilePath = await uploadFileToServer(image, flag, slug);
            console.log("Image file path:", imageFilePath);

            // Create data object with id and path
            imageUrl = {
                id: uuidv4(),
                path: imageFilePath,
                alt: slug,
            };
        }

        // Check for imageGallery in request
        let imageGallery = [];
        if (req.files && req.files.imageGallery) {
            const galleryImages = req.files.imageGallery;
            const galleryFilePaths = await uploadFilesToServer(Array.isArray(galleryImages) ? galleryImages : [galleryImages], slug);
            console.log("Image gallery file paths:", galleryFilePaths);

            // Create data objects for image gallery with ids and paths
            imageGallery = galleryFilePaths.map(filePath => ({
                id: uuidv4(),
                path: filePath,
                alt: slug,
            }));
        }


        // Saving entry in database
        const imageData = await Product.create({
            title,
            shortdec,
            slug,
            description,
            price,
            netAmount,
            category: categories,
            brand: brands,
            metaTitle: title,
            metaDec: description,
            isIndexed,
            inStock,
            isFeature,
            status,
            imageUrl,
            imageGallery,
            discountPrice,
            updatedAt: new Date()
        });

        res.status(200).json({
            success: true,
            data: imageData,
            message: "Product uploaded successfully",
            status: 200,
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
}

// Async function to update product details
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("id", id);

        const { title, shortdec, description, price, category, brand, metaTitle, metaDec, isIndexed, isStock, isFeature, status } = req.body;

        // Find the existing product
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                status: 404,
            });
        }

        // Prepare data for updating
        let updatedData = {
            shortdec,
            description,
            price,
            category,
            brand,
            metaTitle,
            metaDec,
            isIndexed,
            isStock,
            isFeature,
            status,
            updatedAt: new Date()
        };

        if (title) {
            updatedData.title = title;
            // updatedData.slug = generateSlug(title);
            updatedData.metaTitle = title;
        }
        if (shortdec) {
            updatedData.shortdec = shortdec;
        }
        if (description) {
            updatedData.description = description;
            updatedData.metaDec = description;
        }
        if (price) {
            updatedData.price = price;
        }
        if (category) {
            updatedData.category = category;
        }
        if (brand) {
            updatedData.brand = brand;
        }
        if (isFeature) updatedData.isFeature = isFeature;
        if (isIndexed) updatedData.isIndexed = isIndexed;
        if (isStock) updatedData.isStock = isStock;
        if (status) updatedData.status = status;

        // Handle image file update
        if (req.files && req.files.imageFile) {
            // Delete old image
            if (existingProduct.imageUrl && existingProduct.imageUrl.path) {
                await deleteFileFromServer(existingProduct.imageUrl.path);
            }

            const image = req.files.imageFile;
            const slug = existingProduct.slug;

            const imageFilePath = await uploadFileToServer(image, 0, slug);
            updatedData.imageUrl = {
                id: uuidv4(),
                path: imageFilePath,
                alt:existingProduct.slug
            };
        }

        // Handle image gallery update
        if (req.files && req.files.imageGallery) {
            // Delete old image gallery
            if (existingProduct.imageGallery && existingProduct.imageGallery.length > 0) {
                const galleryFilePaths = existingProduct.imageGallery.map(file => file.path);
                await deleteFilesFromServer(galleryFilePaths);
            }

            const galleryImages = req.files.imageGallery;
            const slug = existingProduct.slug;
            const galleryFilePaths = await uploadFilesToServer(Array.isArray(galleryImages) ? galleryImages : [galleryImages], slug);
            updatedData.imageGallery = galleryFilePaths.map(filePath => ({
                id: uuidv4(),
                path: filePath,
                alt:existingProduct.slug,
            }));
        }

        // Update product in database
        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

        res.status(200).json({
            success: true,
            data: updatedProduct,
            status: 200,
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

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

// For deleting the product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("id", id);

        // Find the product
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "No such product exists",
                status: 404,
            });
        }

        // Delete the image from the server
        if (product.imageUrl && product.imageUrl.path) {
            await deleteFileFromServer(product.imageUrl.path);
        }

        // Delete image gallery from the server
        if (product.imageGallery && product.imageGallery.length > 0) {
            const galleryFilePaths = product.imageGallery.map(file => file.path);
            await deleteFilesFromServer(galleryFilePaths);
        }

        // Delete the product from the database
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                status: 404,
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully",
            status: 200,
        });

    } catch (error) {
        console.error(error);
    }
}


//Function for getting the list of all products

exports.getAllProducts = async (req,res) => {
    try{

        const searchName = req.query.name || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const nameRegex = new RegExp(searchName , 'i');

        const query = {
            'title' : {$regex: nameRegex}
        };

        const data = await Product.find(query);

       
        console.log("Data for products", data);
        if(!data) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No product found"
            })
        }

        const total = data.length;
        const totalPages = Math.ceil(total / limit);

        if(page > totalPages){
            return res.status(404).json({
                message: "Page not found",
            })
        }

        const products = await Product.find(query).skip(startIndex).limit(limit).exec(); //Filters can also be applied later

        res.status(200).json({
            success: true,
            status : 200,
            message: "Products found",
            page,
            perPage: limit,
            totalPages: totalPages,
            data: products,

        })
        


    }catch(error){
        res.status(400).json({
            success : false,
            message : "Something went wrong"
        });
    }
}

//Get product by id
exports.getProductDetails = async (req,res) => {
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        console.log(product);
        if(!product){
            return res.status(404).json({
                success : false,
                message: "Product not found",
            })
        }

        return res.status(200).json({
            success: true,
            data: product,
            status: 200,
            message: "Product details found"
        })


    }catch(error){
        res.status(400).json({
            success : false,
            message : "Something went wrong"
        })
    }
}