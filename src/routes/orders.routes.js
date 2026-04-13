const express    = require('express');
const router     = express.Router();
const ordersController = require('../controllers/orders.controller');
const authenticate     = require('../middleware/authenticate');
const authorise        = require('../middleware/authorise');

router.use(authenticate);

router.post(
  '/',
  authorise('buyer'),
  ordersController.createOrder
);

router.get('/',    ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);

router.patch(
  '/:id/status',
  authorise('farmer'),
  ordersController.updateOrderStatus
);

module.exports = router;