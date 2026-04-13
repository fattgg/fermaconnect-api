const express           = require('express');
const router            = express.Router();
const farmersController = require('../controllers/farmers.controller');

router.get('/:id',          farmersController.getFarmerProfile);
router.get('/:id/products', farmersController.getFarmerProducts);

module.exports = router;