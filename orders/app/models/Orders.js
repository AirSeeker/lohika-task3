const knex = require('../../db');
const Joi = require('joi');

class OrdersModel {
    constructor() {
        this.id = null;
        this.meals = null;
        this.itemsIds = null;
    }

    /**
     * Validate view request id params on success set model id
     * @param {number} id
     * @returns {boolean}
     */
    validateId(id) {
        const schema = Joi.number().integer().min(1).required();
        let {value: result, error} = Joi.validate(id, schema);

        if (error === null) {
            this.id = result;
            return true;
        }

        return false;
    }

    /**
     * Validate create request body on success set model meals
     * @param {Object} data
     * @returns {boolean}
     */
    validate(data) {
        const schema = Joi.object().keys({
            meals: Joi.array().items(Joi.string()).min(1).unique().required()
        }).required();

        let {value: result, error} = Joi.validate(data, schema);

        if (error === null) {
            this.meals = result.meals;
            return true;
        }

        return false;
    }

    async findMealsItems() {
        let itemsIds = [];
        if (this.meals.length) {
            try {
                itemsIds = await knex('items').whereIn('name', this.meals);
            } catch (e) {
                return new Error(e.message);
            }

            if (itemsIds.length === this.meals.length) {
                this.itemsIds = itemsIds;
                return true;
            }
        }
        return false;
    }

    /**
     * Save order
     * @returns {Promise<*>}
     */
    async save() {
        let order;
        if (this.itemsIds.length) {
            try {
                await knex.transaction(async (trx) => {
                    order = await trx.insert({}).into('orders').returning(['id', 'created_at']);
                    let rows = this.itemsIds.reduce((accumulator, currentItem) => {
                        accumulator.push({
                            order_id: order[0].id,
                            item_id: currentItem.id
                        });
                        return accumulator;
                    }, []);
                    await knex.batchInsert('order_has_item', rows).transacting(trx);
                });
            } catch (e) {
                return new Error(e.message);
            }

            if (order.length) {
                this.id = order[0].id;
                return true;
            }
        }
        return false;
    }

    /**
     * Select order by id
     * @returns {Promise<*>}
     */
    async findOne() {
        let result;
        try {
            result = await knex('orders')
                .select([
                    'orders.id',
                    'items.name'
                ])
                .join('order_has_item', 'orders.id', 'order_has_item.order_id')
                .join('items', 'items.id', 'order_has_item.item_id')
                .where('orders.id', this.id);
        } catch (e) {
            return new Error(e.message);
        }

        if (!result.length) {
            return false;
        }

        return {
            meals: result.reduce((accumulator, currentValue) => {
                accumulator.push(currentValue);
                return accumulator;
            }, [])
        }
    }
}

module.exports = OrdersModel;