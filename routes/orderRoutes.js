const express = require('express');
const { createOrder, getOrdersByUser } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrdersByUser);

module.exports = router;
