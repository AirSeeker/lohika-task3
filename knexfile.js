// Update with your config settings.

module.exports = {
    client: 'postgresql',
    connection: {
        user: process.env.DB_USER || 'reservation',
        password: process.env.DB_PASSWORD || 'reservation',
        database: process.env.DB_NAME || 'reservation',
        host: process.env.DB_HOST || '127.0.0.1'
    },
    searchPath: ['knex', 'public'],
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
};
