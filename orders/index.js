const express = require('express');
const bodyParser = require('body-parser');
const ordersRoutes = require('./app/routes/orders');

const app = express();
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.type('application/json');
    next();
});

app.use('/api', ordersRoutes);

const server = app.listen(8001, () => {
    console.log('App is running on port 8001');
});

module.exports = server;