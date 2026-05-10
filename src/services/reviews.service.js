const db = require("../db");
const { createReviewSchema } = require("../validations/reviews.validation");

const createReview = async (body, buyerId) => {
  const { error, value } = createReviewSchema.validate(body, {
    abortEarly: false,
    convert: true,
    allowUnknown: true,
  });
  if (error) {
    const err = new Error("Validation failed");
    err.status = 422;
    err.details = error.details.map((d) => d.message);
    throw err;
  }

  const { order_id, rating, comment } = value;

  const orderResult = await db.query(
    `SELECT o.*, p.farmer_id
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE o.id = $1`,
    [order_id],
  );

  const order = orderResult.rows[0];

  if (!order) {
    const err = new Error("Order not found");
    err.status = 404;
    throw err;
  }

  if (order.buyer_id !== buyerId) {
    const err = new Error("You can only review your own orders");
    err.status = 403;
    throw err;
  }

  if (order.status !== "completed") {
    const err = new Error("You can only review completed orders");
    err.status = 400;
    throw err;
  }

  const existing = await db.query(
    "SELECT id FROM reviews WHERE order_id = $1",
    [order_id],
  );

  if (existing.rows.length > 0) {
    const err = new Error("You have already reviewed this order");
    err.status = 409;
    throw err;
  }

  const result = await db.query(
    `INSERT INTO reviews (farmer_id, buyer_id, order_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [order.farmer_id, buyerId, order_id, rating, comment || null],
  );

  return result.rows[0];
};

const getFarmerReviews = async (farmerId) => {
  const farmerResult = await db.query(
    `SELECT id, name FROM users WHERE id = $1 AND role = 'farmer'`,
    [farmerId],
  );

  if (!farmerResult.rows[0]) {
    const err = new Error("Farmer not found");
    err.status = 404;
    throw err;
  }

  const reviewsResult = await db.query(
    `SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      json_build_object(
        'id',   u.id,
        'name', u.name
      ) AS buyer
     FROM reviews r
     JOIN users u ON u.id = r.buyer_id
     WHERE r.farmer_id = $1
     ORDER BY r.created_at DESC`,
    [farmerId],
  );

  const reviews = reviewsResult.rows;

  const avgResult = await db.query(
    `SELECT
      ROUND(AVG(rating)::numeric, 1) AS average,
      COUNT(*)                        AS total,
      COUNT(*) FILTER (WHERE rating = 5) AS five_star,
      COUNT(*) FILTER (WHERE rating = 4) AS four_star,
      COUNT(*) FILTER (WHERE rating = 3) AS three_star,
      COUNT(*) FILTER (WHERE rating = 2) AS two_star,
      COUNT(*) FILTER (WHERE rating = 1) AS one_star
     FROM reviews
     WHERE farmer_id = $1`,
    [farmerId],
  );

  const stats = avgResult.rows[0];

  return {
    farmer: farmerResult.rows[0],
    stats: {
      average: parseFloat(stats.average) || 0,
      total: parseInt(stats.total),
      breakdown: {
        5: parseInt(stats.five_star),
        4: parseInt(stats.four_star),
        3: parseInt(stats.three_star),
        2: parseInt(stats.two_star),
        1: parseInt(stats.one_star),
      },
    },
    reviews,
  };
};

const getMyReviews = async (buyerId) => {
  const result = await db.query(
    `SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      r.order_id,
      json_build_object(
        'id',   u.id,
        'name', u.name
      ) AS farmer
     FROM reviews r
     JOIN users u ON u.id = r.farmer_id
     WHERE r.buyer_id = $1
     ORDER BY r.created_at DESC`,
    [buyerId],
  );

  return result.rows;
};

module.exports = { createReview, getFarmerReviews, getMyReviews };
