const Order = require('../models/orderModel');

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, totalPrice } = req.body;

        const order = new Order({
            user: req.user._id,
            orderItems,
            totalPrice,
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get Orders by User
exports.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
