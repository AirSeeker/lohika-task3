exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('items').del()
        .then(function () {
            // Inserts seed entries
            return knex('items').insert([
                {name: "soup"},
                {name: "steak"},
                {name: "french fries"},
                {name: "pizza"},
                {name: "salad"},
                {name: "burger"},
                {name: "cheesecake"},
                {name: "coca-cola"},
                {name: "coffee"},
                {name: "latte"},
            ]);
        });
};
