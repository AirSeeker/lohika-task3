const OrdersModel = require('../models/Orders');

class Orders {
    static async createOrder(req, res) {
        const model = new OrdersModel();
        if (model.validate(req.body)) {
            let isItemsExists = await model.findMealsItems();

            if (!isItemsExists) {
                return false
            }

            if (isItemsExists instanceof Error) {
                return res.status(500).send();
            }

            let result = await model.save();

            if (result instanceof Error) {
                return res.status(500).send();
            }

            if (result) {
                return res.set('Location', `/api/orders/${model.id}`).status(201).send();
            }
        }
        return res.status(400).send();
    }

    static async getOrderInfo(req, res) {
        const model = new OrdersModel();
        if (!req.params.order_id || !model.validateId(req.params.order_id)) {
            return res.status(400).send();
        }

        const result = await model.findOne();

        if (result instanceof Error) {
            return res.status(500).send();
        }

        if (result) {
            return res.status(200).send(result);
        }

        return res.status(404).send();
    }
}

module.exports = Orders;