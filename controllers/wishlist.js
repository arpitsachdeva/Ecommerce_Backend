const Wishlist = require("../models/wishlist");
const Product = require("../models/product");

exports.addToWishlist = async (req,res) => {
    try{

        const {product_id, wishlist_name} = req.body;

        const user_id = res.locals.id;

        console.log("req body", req.body);
        
        const product = await Product.findById(product_id);
        console.log("Product: ", product);
        if(!product){
            res.status(404).json({
                success: false,
                message:"No such product to add to cart",
                status: 404,
            })
        }

        //Find wishlist by name and user_id
        let wishlist = await Wishlist.findOne({user_id, name: wishlist_name});

        if(!wishlist) {
            //create new wishlist if it doesn't exist
            wishlist = new Wishlist({
                name: wishlist_name,
                user_id,
                product_ids: [product_id],
            });
        } else {
            //check if product already in wishlist

            if(wishlist.product_ids.includes(product_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Product already in wishlist",
                    status: 400,
                });
            }
            // Add product to existing wishlist
            wishlist.product_ids.push(product_id);
        }

        await wishlist.save();
        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            status: 200,
            data: wishlist,
        });


        
    }catch(error){

        return res.status(500).json({
            success : false,
            status: 500,
            message: "Something went wrong",
        })

    }
}

exports.deleteFromWishlist = async (req, res) => {
    try {
        const {product_id, wishlist_name } = req.body;
        const user_id = res.locals.id;
        console.log("user id", user_id);

        // Find the wishlist by user_id and wishlist_name
        const wishlist = await Wishlist.findOne({ user_id, name: wishlist_name });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found",
                status: 404,
            });
        }

        // Check if the product ID is in the wishlist
        const productIndex = wishlist.product_ids.indexOf(product_id);
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist",
                status: 404,
            });
        }

        // Remove the product ID from the product_ids array
        wishlist.product_ids.splice(productIndex, 1);

        // Save the updated wishlist
        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            status: 200,
            data: wishlist,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            status: 500,
        });
    }
};


//Getting details of a particular wishlist by user id and wishlist name
exports.wishlistDetails = async (req,res) => {
    try{

        const user_id = res.locals.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchName = req.query.name || '';
        const id = req.query.id;
        const skipThis = (page-1) * limit;

        const nameRegex = new RegExp(searchName, 'i');

        const query = {
            'user_id' : user_id,
            // 'name' : {$regex : nameRegex},
            '_id': id,
        };

        const data = await Wishlist.find(query);
        console.log("Data for wishlist items", data);

        
        
        if(!data){
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No wishlist items found",
            })
        }

        const total = data.length;
        const totalPages = Math.ceil(total/limit);


        if(page>totalPages){
            return res.status(404).json({
                success: false,
                message: "Page not found",
                status: 404,
            })
        }

        const wishlistItems = await Wishlist.find(query).skip(skipThis).limit(limit).populate('product_ids').exec();
        
        // const products = [];
        // for (const wishlist of wishlistItems) {
        //     for (const product_id of wishlist.product_ids) {
        //         const product = await Product.findById(product_id).lean(); // Fetch product object and convert to plain JS object
        //         if (product) {
        //             products.push(product);
        //         }
        //     }
        // }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Wishlist items found",
            page,
            perPage: limit,
            totalPages,
            data: wishlistItems,
        })


    }catch(error){

        res.status(500).json({
            succesS: false,
            status: 500,
            message: "Internal server error",
        })


    }
}


exports.wishlistList = async (req, res) => {
    try {
        const user_id = res.locals.id; // Assuming user ID is stored in res.locals
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchName = req.query.name || '';
        const skip = (page - 1) * limit;

        // Use a regular expression to search for wishlist names
        const nameRegex = new RegExp(searchName, 'i');

        // Query to find the user's wishlist with optional name filtering
        const query = {
            'user_id': user_id,
            'name': { $regex: nameRegex }
        };

        // Find wishlist items, populate product details, and paginate
        const total = await Wishlist.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages && totalPages !== 0) {
            return res.status(404).json({
                success: false,
                message: "Page not found",
                status: 404,
            });
        }

        const wishlistItems = await Wishlist.find(query)
            .skip(skip)
            .limit(limit)
            .populate('product_ids')  // Populate the product_ids field with product documents
            .exec();

        if (!wishlistItems || wishlistItems.length === 0) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No wishlist items found",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Wishlist items found",
            page,
            perPage: limit,
            totalPages,
            data: wishlistItems,  // The populated product details are included in the wishlistItems
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};


//Getting list of wishlists
// exports.wishlistList = async (req,res) => {
//     try{

//         const user_id = res.locals.id;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skipThis = (page-1) * limit;

//         const query = {
//             'user_id' : user_id
//         };

//         const data = await Wishlist.find(query);
//         console.log("Wish lists", data);

        
        
//         if(!data){
//             return res.status(404).json({
//                 success: false,
//                 status: 404,
//                 message: "No wishlist found",
//             })
//         }

//         const total = data.length;
//         const totalPages = Math.ceil(total/limit);


//         if(page>totalPages){
//             return res.status(404).json({
//                 success: false,
//                 message: "Page not found",
//                 status: 404,
//             })
//         }

//         const wishlistItems = await Wishlist.find(query).skip(skipThis).limit(limit).exec();
        
//         const products = [];
//         for (const wishlist of wishlistItems) {
//             for (const productId of wishlist.product_ids) {
//                 const product = await Product.findById(productId).lean(); // Fetch product object and convert to plain JS object
//                 if (product) {
//                     products.push(product);
//                 }
//             }
//         }

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Wishlist items found",
//             page,
//             perPage: limit,
//             totalPages,
//             data: wishlistItems,
//         })


//     }catch(error){

//         res.status(500).json({
//             succesS: false,
//             status: 500,
//             message: "Internal server error",
//         })


//     }
// }

//Deleting a wishlist
exports.deleteWishlist = async (req,res) => {
    try{

        const user_id = res.locals.id;
        console.log("user id ", user_id);
        
        const existingWishlist = await Wishlist.findOneAndDelete({user_id, _id: req.params.id});

        console.log("Deleted or not", existingWishlist);
        
        res.status(200).json({
            success: true,
            status: 200,
            message:"Wishlist deleted",
        })

    }catch(error){

        res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        })


    }
}

//Deleting a product id from a wishlist

exports.deleteProductFromWishlist = async (req, res) => {
    try {
        const user_id = res.locals.id; // Assuming user_id is obtained from the authenticated user
        const wishlistId = req.params.id; // Wishlist ID is passed as a URL parameter
        const {productId} = req.body ;// Product ID to remove is passed in the request body

        // // Validate the product ID
        // if (!mongoose.Types.ObjectId.isValid(productId)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Invalid product ID",
        //         status: 400,
        //     });
        // }

        // Find the wishlist and remove the product ID
        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { user_id, _id: wishlistId },
            { $pull: { product_ids: productId } },
            { new: true }
        );

        if (!updatedWishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found or product not in wishlist",
                status: 404,
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Product removed from wishlist successfully",
            data: updatedWishlist,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            status: 500,
        });
    }
}