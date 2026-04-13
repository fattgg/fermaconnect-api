const ordersService = require('../services/orders.service');

const createOrder = async (req, res, next) => {
  try {
    const result = await ordersService.createOrder(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const result = await ordersService.getOrders(req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const result = await ordersService.getOrderById(req.params.id, req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await ordersService.updateOrderStatus(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};