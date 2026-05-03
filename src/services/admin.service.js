const db = require("../db");

const getStats = async () => {
  const [usersResult, productsResult, ordersResult, verificationsResult] =
    await Promise.all([
      db.query(`
        SELECT
          COUNT(*)                                    AS total,
          COUNT(*) FILTER (WHERE role = 'farmer')    AS farmers,
          COUNT(*) FILTER (WHERE role = 'buyer')     AS buyers
        FROM users
        WHERE role != 'admin'
      `),
      db.query(`
        SELECT
          COUNT(*)                                    AS total,
          COUNT(*) FILTER (WHERE available = true)   AS available
        FROM products
      `),
      db.query(`
        SELECT
          COUNT(*)                                              AS total,
          COUNT(*) FILTER (WHERE status = 'pending')           AS pending,
          COUNT(*) FILTER (WHERE status = 'accepted')          AS accepted,
          COUNT(*) FILTER (WHERE status = 'completed')         AS completed
        FROM orders
      `),
      db.query(`
        SELECT
          COUNT(*)                                              AS total,
          COUNT(*) FILTER (WHERE status = 'pending')           AS pending,
          COUNT(*) FILTER (WHERE status = 'verified')          AS verified
        FROM verifications
      `),
    ]);

  return {
    users: usersResult.rows[0],
    products: productsResult.rows[0],
    orders: ordersResult.rows[0],
    verifications: verificationsResult.rows[0],
  };
};

const getVerifications = async () => {
  const result = await db.query(`
    SELECT
      v.id,
      v.status,
      v.doc_url,
      v.farm_photo_url,
      v.admin_note,
      v.submitted_at,
      json_build_object(
        'id',           u.id,
        'name',         u.name,
        'email',        u.email,
        'phone',        u.phone,
        'municipality', u.municipality,
        'created_at',   u.created_at
      ) AS farmer
    FROM verifications v
    JOIN users u ON u.id = v.farmer_id
    ORDER BY
      CASE v.status WHEN 'pending' THEN 0 ELSE 1 END,
      v.submitted_at DESC
  `);

  return result.rows;
};

const updateVerification = async (id, status, adminNote) => {
  if (!["verified", "rejected"].includes(status)) {
    const err = new Error("Status must be verified or rejected");
    err.status = 400;
    throw err;
  }

  const result = await db.query(
    `UPDATE verifications
     SET status = $1, admin_note = $2
     WHERE id = $3
     RETURNING *`,
    [status, adminNote || null, id],
  );

  if (!result.rows[0]) {
    const err = new Error("Verification not found");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const getUsers = async (role) => {
  const conditions = role ? `WHERE u.role = $1` : `WHERE u.role != 'admin'`;
  const values = role ? [role] : [];

  const result = await db.query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.phone,
      u.municipality,
      u.created_at,
      COUNT(p.id) AS product_count,
      COUNT(o.id) AS order_count
    FROM users u
    LEFT JOIN products p ON p.farmer_id = u.id
    LEFT JOIN orders   o ON o.buyer_id  = u.id
    ${conditions}
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `,
    values,
  );

  return result.rows;
};

module.exports = {
  getStats,
  getVerifications,
  updateVerification,
  getUsers,
};