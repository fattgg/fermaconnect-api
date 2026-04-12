const productsService = require('../services/products.service');

const getProducts = async (req, res, next) => {
  try {
    const result = await productsService.getProducts(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const result = await productsService.getProductById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const result = await productsService.createProduct(req.body, req.files, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const result = await productsService.updateProduct(req.params.id, req.body, req.files, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productsService.deleteProduct(req.params.id, req.user.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const toggleAvailability = async (req, res, next) => {
  try {
    const result = await productsService.toggleAvailability(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
};