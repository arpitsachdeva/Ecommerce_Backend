const Product = require("../models/product");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import UUID library


// For generating slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[*+~.()'"!:@]+/g, '');
}

// For uploading image to server
async function uploadFileToServer(file, flag) {
    const fileName = `${uuidv4()}_${Date.now()}${path.extname(file.name)}`; // Ensure unique file names
    let filePath;
    if(flag === 0){
        filePath = path.join(__dirname, '../productFiles/image', fileName); // path of server
    }
    else{
        filePath = path.join(__dirname, '../productFiles/imageGallery', fileName); // path of server
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
async function uploadFilesToServer(files) {
    const flag = 1;
    const uploads = files.map(file => uploadFileToServer(file , flag));
    return await Promise.all(uploads);
}


// Async function to add product
exports.addProduct = async (req, res) => {
    try {
        const { title, shortdec, description, price, category, brand, metaTitle, metaDec, isIndexed, isStock, isFeature, status } = req.body;

        console.log(title, shortdec, description, price, category, brand, metaTitle, metaDec, isIndexed, isStock, isFeature, status);

        const slug = generateSlug(title);
        console.log("Generated slug:", slug);

        const image = req.files.imageFile;
        console.log("Image", image);

        // Upload image to server
        const flag = 0;
        const imageFilePath = await uploadFileToServer(image, flag);
        console.log("Image file path:", imageFilePath);

        // Upload multiple images to server for the image gallery
        const galleryImages = req.files.imageGallery;
        const galleryFilePaths = await uploadFilesToServer(galleryImages);
        console.log("Image gallery file paths:", galleryFilePaths);

        // Create data objects with ids and paths
        const imageUrl = {
            id: uuidv4(),
            path: imageFilePath
        };

        const imageGallery = galleryFilePaths.map(filePath => ({
            id: uuidv4(),
            path: filePath
        }));

        // Saving entry in database
        const imageData = await Product.create({
            title,
            shortdec,
            slug,
            description,
            price,
            category,
            brand,
            metaTitle: title,
            metaDec: description,
            isIndexed,
            isStock,
            isFeature,
            status,
            imageUrl,  // Store object with id and path
            imageGallery,  // Store array of objects with id and path
            updatedAt: new Date()  // Update the updatedAt field
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
            updatedData.slug = generateSlug(title);
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
            const imageFilePath = await uploadFileToServer(image, 0);
            updatedData.imageUrl = {
                id: uuidv4(),
                path: imageFilePath
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
            const galleryFilePaths = await uploadFilesToServer(galleryImages);
            updatedData.imageGallery = galleryFilePaths.map(filePath => ({
                id: uuidv4(),
                path: filePath
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

//For deleting the product
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
            const imageFileName = path.basename(product.imageUrl.path);
            const imageFilePath = path.join(__dirname, '../productFiles/image', imageFileName);
            await deleteFileFromServer(imageFilePath);
        }

        // Delete image gallery from the server
        if (product.imageGallery && product.imageGallery.length > 0) {
            const galleryFilePaths = product.imageGallery.map(file => path.join(__dirname, '../productFiles/imageGallery', path.basename(file.path)));
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
        res.status(400).json({
            success: false,
            message: "Something went wrong",
        });
    }
}


//Function for getting the list of all products

exports.getAllProducts = async (req,res) => {
    try{

        const productList = await Product.find();
        console.log(productList);
        if(!productList){
            return res.status(404).json({
                success : false,
                message: "Product not found",
            })
        }

        return res.status(200).json({
            success: true,
            data: productList,
            status: 200,
            message: "List of products found"
        })


    }catch(error){
        res.status(400).json({
            success : false,
            message : "Something went wrong"
        })
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