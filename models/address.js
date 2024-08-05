const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    addressLine1:{
        type: String,
        required: true,
    },
    addressLine2:{
        type: String,
    },
    country:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'countrystate',
    },
    state:{
        type: String,
    },
    city:{
        type: String,
    },
    postalCode:{
        type: String,
    },
    phone_number:{
        type:String,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    },
    updatedAt:{
        type: Date,
    }
});

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;
