const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
    process.env.SUPABASE_DB_NAME,
    process.env.SUPABASE_DB_USER,
    process.env.SUPABASE_DB_PASSWORD,
    {
        host: process.env.SUPABASE_DB_HOST,
        dialect: 'postgres',
        port: process.env.SUPABASE_DB_PORT,
        logging: false,
    }
);

module.exports = sequelize;