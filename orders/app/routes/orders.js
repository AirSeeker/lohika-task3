const express = require('express');
const router = express.Router();
const ordersCtrl = require('../controllers/orders');

router.route('/orders').post(ordersCtrl.createOrder);
router.route('/orders/:order_id').get(ordersCtrl.getOrderInfo);

module.exports = router;