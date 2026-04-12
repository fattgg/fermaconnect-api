const db = require('../db');
const { createProductSchema, updateProductSchema } = require('../validations/products.validation');

const getProducts = async (query) => {
  const {
    category,
    municipality,
    search,
    available = 'true',
    page  = 1,
    limit = 10,
  } = query;

  const conditions = [];
  const values     = [];
  let   paramIndex = 1;

  if (available === 'true') {
    conditions.push(`p.available = true`);
  }

  if (category) {
    conditions.push(`p.category = $${paramIndex}`);
    values.push(category.toLowerCase());
    paramIndex++;
  }

  if (municipality) {
    conditions.push(`u.municipality ILIKE $${paramIndex}`);
    values.push(municipality);
    paramIndex++;
  }

  if (search) {
    conditions.push(
      `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit))); 
  const offset   = (pageNum - 1) * limitNum;

  const productsQuery = `
    SELECT
      p.id,
      p.name,
      p.category,
      p.description,
      p.price,
      p.unit,
      p.quantity,
      p.available,
      p.photo_urls,
      p.created_at,
      json_build_object(
        'id',           u.id,
        'name',         u.name,
        'municipality', u.municipality,
        'avatar_url',   u.avatar_url
      ) AS farmer
    FROM products p
    JOIN users u ON u.id = p.farmer_id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  values.push(limitNum, offset);

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM products p
    JOIN users u ON u.id = p.farmer_id
    ${whereClause}
  `;

  const [productsResult, countResult] = await Promise.all([
    db.query(productsQuery, values),
    db.query(countQuery,    values.slice(0, -2)), 
  ]);

  const total      = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limitNum);

  return {
    products: productsResult.rows,
    meta: {
      total,
      page:        pageNum,
      limit:       limitNum,
      total_pages: totalPages,
      has_next:    pageNum < totalPages,
      has_prev:    pageNum > 1,
    },
  };
};

const getProductById = async (id) => {
  const result = await db.query(
    `SELECT
      p.id,
      p.name,
      p.category,
      p.description,
      p.price,
      p.unit,
      p.quantity,
      p.available,
      p.photo_urls,
      p.created_at,
      p.updated_at,
      json_build_object(
        'id',           u.id,
        'name',         u.name,
        'phone',        u.phone,
        'municipality', u.municipality,
        'avatar_url',   u.avatar_url
      ) AS farmer
    FROM products p
    JOIN users u ON u.id = p.farmer_id
    WHERE p.id = $1`,
    [id]
  );

  if (!result.rows[0]) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const createProduct = async (body, files, farmerId) => {
  const { error, value } = createProductSchema.validate(body, { abortEarly: false });
  if (error) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = error.details.map((d) => d.message);
    throw err;
  }

  const { name, category, description, price, unit, quantity } = value;

  const photoUrls = files && files.length > 0
    ? files.map((file) => file.path)
    : [];

  const result = await db.query(
    `INSERT INTO products
      (farmer_id, name, category, description, price, unit, quantity, photo_urls)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      farmerId,
      name,
      category,
      description || null,
      price,
      unit,
      quantity,
      JSON.stringify(photoUrls),
    ]
  );

  return result.rows[0];
};

const updateProduct = async (id, body, files, farmerId) => {
  const existing = await db.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );

  if (!existing.rows[0]) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (existing.rows[0].farmer_id !== farmerId) {
    const err = new Error('You are not allowed to edit this product');
    err.status = 403;
    throw err;
  }

  const { error, value } = updateProductSchema.validate(body, { abortEarly: false });
  if (error) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = error.details.map((d) => d.message);
    throw err;
  }

  const fields = [];
  const values = [];
  let   paramIndex = 1;

  const allowedFields = ['name', 'category', 'description', 'price', 'unit', 'quantity'];

  for (const field of allowedFields) {
    if (value[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(value[field]);
      paramIndex++;
    }
  }

  if (files && files.length > 0) {
    const newUrls      = files.map((file) => file.path);
    const existingUrls = existing.rows[0].photo_urls || [];
    const merged       = [...existingUrls, ...newUrls].slice(0, 3);

    fields.push(`photo_urls = $${paramIndex}`);
    values.push(JSON.stringify(merged));
    paramIndex++;
  }

  if (fields.length === 0) {
    return existing.rows[0];
  }

  values.push(id);

  const result = await db.query(
    `UPDATE products
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

const deleteProduct = async (id, farmerId) => {
  return { message: 'deleteProduct — coming in Step 3.7' };
};

const toggleAvailability = async (id, farmerId) => {
  return { message: 'toggleAvailability — coming in Step 3.7' };
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
};