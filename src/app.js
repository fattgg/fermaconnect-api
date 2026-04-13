require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const authRoutes     = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes   = require('./routes/orders.routes');

app.use('/api/auth',     authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders',   ordersRoutes);

app.get('/health', async (req, res) => {
  const db = require('./db');
  try {
    const result = await db.query('SELECT NOW() AS time');
    res.json({
      status: 'ok',
      message: 'FermaConnect API is running',
      db_time: result.rows[0].time,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.code === '22P02') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const status  = err.status  || 500;
  const message = err.message || 'Internal server error';

  const response = { message };

  if (err.details) {
    response.errors = err.details;
  }

  res.status(status).json(response);
});

module.exports = app;