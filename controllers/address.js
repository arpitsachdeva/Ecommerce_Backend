const mongoose = require('mongoose');
const Address = require('../models/address');
const User = require('../models/userModel');
const Location = require('../models/location');

exports.addAddress = async (req,res) =>{
    try{

        const {addressLine1, addressLine2, country_id , state_name , city_name , postalCode, phone_number} = req.body;
        const user_id = req.user.id;

        const user = await User.findById(user_id);
        if(!user){
            return res.status(404).json({
                success: false,
                message:"User not found",
                status: 404,
            });
        }

        const country = await Location.findById(country_id, 'states');
        if(!country){
            return res.status(404).json({
                success: false,
                message:"Country not found",
                status: 404,
            });
        }
        const state = country.states.find(state => state.name.toLowerCase() === state_name.toLowerCase());

        if(!state){
            return res.status(404).json({
                success: false,
                message: "State not found in the provided country",
                status: 404,
            });
        }

        //Extract city names from the found state
        const city = state.cities.find(city => city.name.toLowerCase() === city_name.toLowerCase());
        if(!city){
            return res.status(404).json({
                success: false,
                message: "City not found in the provided state",
                status: 404,
            });
        }

        //Save details of the country, state and city
        const locationDetails = await Address.create({
            user_id,
            country: country_id,
            state: state.name,
            city: city.name,
            addressLine1, addressLine2,
            postalCode, phone_number
        });
        

        return res.status(200).json({
            success: true,
            data: locationDetails,
            message: "Address saved successfully",
            status: 200,
        })

        

    }catch(error){

        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            status: 500,
        });

    }
}

exports.updateAddress = async (req, res) => {
    try {
        const { addressLine1, addressLine2, state_name, city_name, postalCode, phone_number } = req.body;
        let { country_id } = req.body;
        const id = req.params.id;
        const user_id = req.user.id;

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                status: 404,
            });
        }

        const existingAddress = await Address.findById(id);
        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
                status: 404,
            });
        }

        const updatedAddress = { updatedAt: Date.now() };
        let country;

        if(country_id && (!state_name || !city_name)){
            return res.status(400).json({
                success: false,
                message: "Enter details correctly",
                status: 400,
            });
        }

        if (country_id) {
            country = await Location.findById(country_id, 'states');
            if (!country) {
                return res.status(404).json({
                    success: false,
                    message: "Country not found",
                    status: 404,
                });
            }
            updatedAddress.country = country_id;
        } else if (!country_id && state_name) {
            country_id = existingAddress.country;
            country = await Location.findById(country_id, 'states');
        }

        let state;
        if (state_name || city_name) {
            if (!state_name) {
                state = country.states.find(state => state.name.toLowerCase() === existingAddress.state.toLowerCase());
            } else {
                state = country.states.find(state => state.name.toLowerCase() === state_name.toLowerCase());
            }

            if (!state) {
                return res.status(404).json({
                    success: false,
                    message: "State not found in the provided country",
                    status: 404,
                });
            }
            updatedAddress.state = state.name;

            if (city_name) {
                const city = state.cities.find(city => city.name.toLowerCase() === city_name.toLowerCase());
                if (!city) {
                    return res.status(404).json({
                        success: false,
                        message: "City not found in the provided state",
                        status: 404,
                    });
                }
                updatedAddress.city = city.name;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "City name cannot be left blank",
                    status: 400,
                });
            }
        }

        if (addressLine1) {
            updatedAddress.addressLine1 = addressLine1;
        }
        if (addressLine2) {
            updatedAddress.addressLine2 = addressLine2;
        }
        if (postalCode) {
            updatedAddress.postalCode = postalCode;
        }
        if (phone_number) {
            updatedAddress.phone_number = phone_number;
        }

        const updateAddress = await Address.findByIdAndUpdate(id, updatedAddress, { new: true });

        return res.status(200).json({
            success: true,
            data: updateAddress,
            message: "Address updated successfully",
            status: 200,
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

exports.getAddressDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findById(id);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
                status: 404,
            });
        }

        const country = await Location.findById(address.country);
        if (!country) {
            return res.status(404).json({
                success: false,
                message: "Country not found",
                status: 404,
            });
        }

        const addressDetails = {
            ...address._doc,
            country_name: country.name,
        };

        res.status(200).json({
            success: true,
            data: addressDetails,
            message: "Address details retrieved successfully",
            status: 200,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            status: 500,
        });
    }
};

exports.getUserAddresses = async (req, res) => {
    try {
        const user_id = req.user.id; // Assuming the user ID is available in the request

        // Find addresses by user ID and populate the country information
        const addresses = await Address.find({ user_id }).populate('country', 'name');

        if (!addresses.length) {
            return res.status(404).json({
                success: false,
                message: 'No addresses found for this user',
                status: 404,
            });
        }

        // Format the addresses to include the country name
        const addressList = addresses.map(address => ({
            ...address._doc,
            country_name: address.country.name,
        }));

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Addresses retrieved successfully',
            data: addressList,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            status: 500,
        });
    }
};
