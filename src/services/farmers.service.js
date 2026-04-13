const db = require('../db');

const getFarmerProfile = async (id) => {
  const farmerResult = await db.query(
    `SELECT
      id,
      name,
      municipality,
      avatar_url,
      created_at
     FROM users
     WHERE id = $1
       AND role = 'farmer'`,
    [id]
  );

  const farmer = farmerResult.rows[0];

  if (!farmer) {
    const err = new Error('Farmer not found');
    err.status = 404;
    throw err;
  }

  const statsResult = await db.query(
    `SELECT
      COUNT(*)                                    AS total_products,
      COUNT(*) FILTER (WHERE available = true)    AS available_products,
      MIN(price)                                  AS min_price,
      MAX(price)                                  AS max_price
     FROM products
     WHERE farmer_id = $1`,
    [id]
  );

  const verifiedResult = await db.query(
    `SELECT status
     FROM verifications
     WHERE farmer_id = $1
       AND status = 'verified'
     LIMIT 1`,
    [id]
  );

  return {
    ...farmer,
    is_verified:        verifiedResult.rows.length > 0,
    stats: {
      total_products:     parseInt(statsResult.rows[0].total_products),
      available_products: parseInt(statsResult.rows[0].available_products),
      min_price:          statsResult.rows[0].min_price,
      max_price:          statsResult.rows[0].max_price,
    },
  };
};

const getFarmerProducts = async (id) => {
  const farmerResult = await db.query(
    `SELECT id, name, municipality
     FROM users
     WHERE id = $1
       AND role = 'farmer'`,
    [id]
  );

  if (!farmerResult.rows[0]) {
    const err = new Error('Farmer not found');
    err.status = 404;
    throw err;
  }

  const productsResult = await db.query(
    `SELECT
      id,
      name,
      category,
      description,
      price,
      unit,
      quantity,
      available,
      photo_urls,
      created_at
     FROM products
     WHERE farmer_id = $1
     ORDER BY available DESC, created_at DESC`,
    [id]
  );

  return {
    farmer:   farmerResult.rows[0],
    products: productsResult.rows,
  };
};

module.exports = { getFarmerProfile, getFarmerProducts };