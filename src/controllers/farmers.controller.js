const farmersService = require('../services/farmers.service');

const getFarmerProfile = async (req, res, next) => {
  try {
    const result = await farmersService.getFarmerProfile(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getFarmerProducts = async (req, res, next) => {
  try {
    const result = await farmersService.getFarmerProducts(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getFarmerProfile, getFarmerProducts };