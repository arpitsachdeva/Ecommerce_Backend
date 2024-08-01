const express = require("express");
const app = express();
require('dotenv').config();
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const categoryRoutes = require("./routes/category");
const imageRoute = require("./routes/imageRoutes");
const brandRoute = require("./routes/brand");
const cartRoute = require("./routes/cart");
const wishlistRoute = require("./routes/wishlist");
const couponRoute = require("./routes/coupon");

//adding middleware
app.use(express.json());
app.use(cookieParser());
const fileupload = require("express-fileupload");

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

//connecting with database
require('./config/database').connect();

//connecting with cloud
const cloudinary = require("./config/cloudinary");
cloudinary.cloudinaryConnect();

//mounting the api route
const productRoutes = require('./routes/product');
const { addCartItem } = require("./controllers/cartItem");
app.use('/api/v1', productRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", imageRoute);
app.use("/api/v1", brandRoute );
app.use("/api/v1", cartRoute);
app.use("/api/v1", wishlistRoute);
app.use("/api/v1", couponRoute);


//activating server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
    console.log(`Server started at port ${PORT}`);
})

