module.exports = {
    test: {
        client: 'postgresql',
        connection: {
            user: process.env.TEST_DB_USER || 'order_test',
            password: process.env.TEST_DB_PASSWORD || 'order_test',
            database: process.env.TEST_DB_NAME || 'order_test',
            host: process.env.TEST_DB_HOST || '127.0.0.1'
        },
        searchPath: ['knex', 'public'],
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        client: 'postgresql',
        connection: {
            user: process.env.DB_USER || 'order',
            password: process.env.DB_PASSWORD || 'order',
            database: process.env.DB_NAME || 'order',
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
    }
};
