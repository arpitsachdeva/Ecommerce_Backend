const Cart = require("../models/cart");
const Product = require("../models/product");

exports.addCartItem = async (req,res) => {
    try{

        const {product_id , quantity} = req.body;

        console.log("req body", req.body);
        
        const product = await Product.findById(product_id);

        console.log("Product: ", product);

        if(!product){
            return res.status(404).json({
                success: false,
                message:"No such product to add to cart",
                status: 404,
            })
        }

        // Check if the product is already in the cart for this user
        const user_id = res.locals.id;
        console.log("User id", res.locals.id);
        const existingCartItem = await Cart.findOne({ user_id, product_id });

        if (existingCartItem) {
            return res.status(400).json({
                success: false,
                message: "Item is already in the cart",
                status: 400,
            });
        }

        if(!quantity){
            quantity = 1;
        }
        
        const amountPerPiece = product.netAmount;
        const discountPerPiece = product.discountPrice;
        const totalPriceOfCartItem = amountPerPiece * quantity;
        const totalDiscountofCartItem = discountPerPiece * quantity;
        const productName = product.title;
        console.log("product id",product_id)
        const cartItemData = await Cart.create({
            user_id,
            product_id,
            productName,
            quantity,
            amountPerPiece,
            discountPerPiece,
            totalPriceOfCartItem,
            totalDiscountofCartItem,
        });

        console.log("cart",cartItemData);

        return res.status(200).json({
            success : true,
            status: 200,
            message: "Item added to cart successfully",
            data: cartItemData,
        })

    }catch(error){

        return res.status(400).json({
            success : false,
            status: 400,
            message: "Something went wrong",
        })

    }
}

exports.updateCartItem = async (req,res) => {
    try{
        const {task, id} = req.body;
        console.log("task", task);
        
        //Find existing item
        const existingCartItem = await Cart.findById(id);

        if (!existingCartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
                status: 404,
            });
        }

        console.log("Cart Item: ", existingCartItem);

        let newQuantity = existingCartItem.quantity;

        if(task === "add"){
            newQuantity+= 1;
            totalPriceOfCartItem += amountPerPiece;
            totalDiscountofCartItem += discountPerPiece;
            
        }
        else if (task === "remove" && newQuantity > 1) { 
            newQuantity -= 1;
            totalPriceOfCartItem -= amountPerPiece;
            totalDiscountofCartItem -= discountPerPiece;
        }

        const updatedCart = await Cart.findByIdAndUpdate(id, {quantity: newQuantity, updatedAt: Date.now(), totalDiscountofCartItem, totalPriceOfCartItem}, {new:true});

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cart item updated successfully",
            data: updatedCart
        });



    }catch(error){

        return res.status(400).json({
            success : false,
            status: 400,
            message: "Something went wrong",
        });

    }
};

exports.deleteCartItem = async (req,res) => {
    try{

        const {id} = req.params;

        const deletedCartItem = await Cart.findByIdAndDelete(id);

        if (!deletedCartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
                status: 404,
            });
        }

        res.status(200).json({
            success: true,
            status: 200,
            message:"Cart item deleted",
        })

    }catch(error){
        return res.status(400).json({
            success : false,
            status: 400,
            message: "Something went wrong",
        });
    }
}

exports.getAllCartItems = async (req,res) => {
    try{
        // const searchName = req.query.name || '';
        const user_id = res.locals.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        // const user_id = req.user_id;

        const query = {
            'user_id': user_id
        }
        // const nameRegex = new RegExp(searchName , 'i');

        // const query = {
        //     'title' : {$regex: nameRegex}
        // };

        const data = await Cart.find(query);
        console.log("Data for cart items", data);
        if(!data) {
            res.status(404).json({
                success: false,
                status: 404,
                message: "No cart item found"
            })
        }

        const total = data.length;
        const totalPages = Math.ceil(total / limit);

        if(page > totalPages){
            return res.status(404).json({
                message: "Page not found",
            })
        }

        const cartItems = await Cart.find(query).skip(startIndex).limit(limit).populate("product_id").exec(); //Filters can also be applied later

        res.status(200).json({
            success: true,
            status : 200,
            message: "Cart items found",
            page,
            perPage: limit,
            totalPages: totalPages,
            data: cartItems,

        })
        
    }catch(error){

        res.status(400).json({
            success : false,
            message : "Something went wrong"
        });

    }
}

