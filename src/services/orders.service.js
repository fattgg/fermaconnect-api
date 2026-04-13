const db = require('../db');
const { createOrderSchema, updateStatusSchema } = require('../validations/orders.validation');

const createOrder = async (body, buyerId) => {
  return { message: '1' };
};

const getOrders = async (user) => {
  return { message: '2' };
};

const getOrderById = async (id, user) => {
  return { message: '3' };
};

const updateOrderStatus = async (id, body, farmerId) => {
  return { message: '4' };
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};