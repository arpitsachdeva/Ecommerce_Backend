const Country = require('../models/location');
require("dotenv").config();

// Controller to retrieve the names of all countries
exports.getAllCountryNames = async (req, res) => {
  try {
    const countries = await Country.find({}, 'name'); // Retrieve only the name field
    return res.status(200).json({
        success: true,
        message: "Retrieved successfully",
        data: countries,
        status: 200
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Controller to retrieve the names of all states of a specific country

exports.getStatesByCountry = async (req,res) => {
    try{
        const countryName = req.params.countryName;
        const country = await Country.findOne({name: countryName}, 'states');

        if(!country) {
            return res.status(404).json({message: 'Country not found'});
        }

        const stateNames = country.states.map( state => state.name);

        return res.status(200).json({
            success: true,
            message:"Retrieved successfully",
            data: stateNames,
            status: 200,
        });

    }catch(error){
        return res.status(500).json({
            message : error.message
        });
    }
}

exports.getCitiesByStateAndCountry = async (req,res) =>{
    const countryName = req.params.countryName;
    const stateName = req.params.stateName;

    try{

        //find the country by name and retrieve only the states field
        const country = await Country.findOne({name: countryName}, 'states');

        if(!country){
            return res.status(404).json({
                message: "Country not found"
            });
        }

        //find state within the country
        const state = country.states.find(state => state.name === stateName);

        if(!state){
            return res.status(404).json({message:"State not found"});
        }

        const cityNames = state.cities.map(city => city.name); //Extract city names

        return res.status(200).json({
            success: true,
            data: cityNames,
            message:"Retrieved successfully",
            status: 200,
        })

    }catch(error){
        return res.status(500).json({message: error.message});
    }
}