const db = require('../db');
const { createOrderSchema, updateStatusSchema } = require('../validations/orders.validation');

const createOrder = async (body, buyerId) => {
  const { error, value } = createOrderSchema.validate(body, { abortEarly: false });
  if (error) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = error.details.map((d) => d.message);
    throw err;
  }

  const { product_id, quantity, contact_info, note } = value;

  const productResult = await db.query(
    `SELECT p.id, p.name, p.available, p.quantity, p.farmer_id,
            u.name AS farmer_name
     FROM products p
     JOIN users u ON u.id = p.farmer_id
     WHERE p.id = $1`,
    [product_id]
  );

  const product = productResult.rows[0];

  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (!product.available) {
    const err = new Error('This product is not available');
    err.status = 400;
    throw err;
  }

  if (product.farmer_id === buyerId) {
    const err = new Error('You cannot order your own product');
    err.status = 400;
    throw err;
  }

  if (quantity > product.quantity) {
    const err = new Error(
      `Only ${product.quantity} units available`
    );
    err.status = 400;
    throw err;
  }

  const result = await db.query(
    `INSERT INTO orders (buyer_id, product_id, quantity, contact_info, note)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [buyerId, product_id, quantity, contact_info, note || null]
  );

  const order = result.rows[0];

  return {
    ...order,
    product: {
      id:           product.id,
      name:         product.name,
      farmer_name:  product.farmer_name,
    },
  };
};

const getOrders = async (user) => {
  let result;

  if (user.role === 'buyer') {
    result = await db.query(
      `SELECT
        o.id,
        o.quantity,
        o.status,
        o.note,
        o.contact_info,
        o.created_at,
        o.updated_at,
        json_build_object(
          'id',          p.id,
          'name',        p.name,
          'price',       p.price,
          'unit',        p.unit,
          'photo_urls',  p.photo_urls,
          'farmer_name', u.name,
          'farmer_id',   u.id
        ) AS product
      FROM orders o
      JOIN products p ON p.id = o.product_id
      JOIN users    u ON u.id = p.farmer_id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC`,
      [user.id]
    );
  } else {
    result = await db.query(
      `SELECT
        o.id,
        o.quantity,
        o.status,
        o.note,
        o.contact_info,
        o.created_at,
        o.updated_at,
        json_build_object(
          'id',         p.id,
          'name',       p.name,
          'price',      p.price,
          'unit',       p.unit,
          'photo_urls', p.photo_urls
        ) AS product,
        json_build_object(
          'id',    b.id,
          'name',  b.name,
          'phone', b.phone
        ) AS buyer
      FROM orders o
      JOIN products p ON p.id = o.product_id
      JOIN users    b ON b.id = o.buyer_id
      WHERE p.farmer_id = $1
      ORDER BY o.created_at DESC`,
      [user.id]
    );
  }

  return { orders: result.rows };
};

const getOrderById = async (id, user) => {
  const result = await db.query(
    `SELECT
      o.id,
      o.quantity,
      o.status,
      o.note,
      o.contact_info,
      o.created_at,
      o.updated_at,
      json_build_object(
        'id',          p.id,
        'name',        p.name,
        'price',       p.price,
        'unit',        p.unit,
        'photo_urls',  p.photo_urls,
        'farmer_id',   u.id,
        'farmer_name', u.name,
        'farmer_phone', u.phone
      ) AS product,
      json_build_object(
        'id',    b.id,
        'name',  b.name,
        'phone', b.phone
      ) AS buyer
    FROM orders o
    JOIN products p ON p.id = o.product_id
    JOIN users    u ON u.id = p.farmer_id
    JOIN users    b ON b.id = o.buyer_id
    WHERE o.id = $1`,
    [id]
  );

  const order = result.rows[0];

  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  const isBuyer  = order.buyer.id   === user.id;
  const isFarmer = order.product.farmer_id === user.id;

  if (!isBuyer && !isFarmer) {
    const err = new Error('You are not allowed to view this order');
    err.status = 403;
    throw err;
  }

  return order;
};

const updateOrderStatus = async (id, body, farmerId) => {
  const { error, value } = updateStatusSchema.validate(body, { abortEarly: false });
  if (error) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = error.details.map((d) => d.message);
    throw err;
  }

  const { status } = value;

  const existing = await db.query(
    `SELECT o.*, p.farmer_id
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE o.id = $1`,
    [id]
  );

  const order = existing.rows[0];

  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  if (order.farmer_id !== farmerId) {
    const err = new Error('You are not allowed to update this order');
    err.status = 403;
    throw err;
  }

  const validTransitions = {
    pending:  ['accepted', 'rejected'],
    accepted: ['completed'],
    rejected: [],
    completed: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    const err = new Error(
      `Cannot transition from "${order.status}" to "${status}"`
    );
    err.status = 400;
    throw err;
  }

  const result = await db.query(
    `UPDATE orders
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};