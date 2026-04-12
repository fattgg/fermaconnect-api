const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const signToken = (user) => {
  return jwt.sign(
    {
      id:    user.id,
      email: user.email,
      role:  user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const formatUser = (user) => ({
  id:           user.id,
  name:         user.name,
  email:        user.email,
  role:         user.role,
  phone:        user.phone,
  municipality: user.municipality,
  avatar_url:   user.avatar_url,
  created_at:   user.created_at,
});

const register = async (data) => {
  const { error, value } = registerSchema.validate(data, { abortEarly: false });
  if (error) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = error.details.map((d) => d.message);
    throw err;
  }

  const { name, email, password, role, phone, municipality } = value;

  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (existing.rows.length > 0) {
    const err = new Error('Email is already registered');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (name, email, password, role, phone, municipality)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, email.toLowerCase(), hashedPassword, role, phone || null, municipality || null]
  );

  const newUser = result.rows[0];

  const token = signToken(newUser);

  return {
    token,
    user: formatUser(newUser),
  };
};

const login = async (data) => {
  return { message: 'login – coming in Step 2.4' };
};

const getMe = async (id) => {
  return { message: 'getMe – coming in Step 2.5' };
};

module.exports = { register, login, getMe, formatUser };