const express = require("express");
const app = express();
require('dotenv').config();


//adding middleware
app.use(express.json());
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
const index = require('./routes/product');
app.use('/api/v1', index);

//activating server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
    console.log(`Server started at port ${PORT}`);
})

