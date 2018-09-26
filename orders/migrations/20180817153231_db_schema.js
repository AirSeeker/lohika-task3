exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('orders', function (table) {
            table.increments('id').primary();
            table.timestamp('created_at').notNull().defaultTo(knex.fn.now());
        }),
        knex.schema.createTable('items', function (table) {
            table.increments('id').primary();
            table.string('name').notNull();
        }),
        knex.schema.createTable('order_has_item', function (table) {
            table.increments('id').primary();
            table.integer('order_id').notNull();
            table.integer('item_id').notNull();
            table.foreign('order_id').references('orders.id');
            table.foreign('item_id').references('items.id');
        }),
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.table('order_has_item', function (table) {
            table.dropForeign('order_id');
            table.dropForeign('item_id');
        }),
        knex.schema.dropTable('order_has_item'),
        knex.schema.dropTable('orders'),
        knex.schema.dropTable('items')
    ])
};
