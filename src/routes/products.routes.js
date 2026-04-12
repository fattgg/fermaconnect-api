const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const authenticate = require('../middleware/authenticate');
const authorise    = require('../middleware/authorise');
const { upload }   = require('../config/cloudinary');

router.get('/',    productsController.getProducts);
router.get('/:id', productsController.getProductById);

router.post(
  '/',
  authenticate,
  authorise('farmer'),
  upload.array('photos', 3),
  productsController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorise('farmer'),
  upload.array('photos', 3),
  productsController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorise('farmer'),
  productsController.deleteProduct
);

router.patch(
  '/:id/availability',
  authenticate,
  authorise('farmer'),
  productsController.toggleAvailability
);

module.exports = router;