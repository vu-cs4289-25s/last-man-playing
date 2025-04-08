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

// /backend/config/database.js

// require('dotenv').config({ path: '../.env' });
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(
//   process.env.SUPABASE_DB_NAME,
//   process.env.SUPABASE_DB_USER,
//   process.env.SUPABASE_DB_PASSWORD,
//   {
//     host: process.env.SUPABASE_DB_HOST,
//     port: process.env.SUPABASE_DB_PORT,
//     dialect: 'postgres',
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false
//       }
//     },
//     logging: false // turn off logging if you want cleaner console output
//   }
// );

// module.exports = sequelize;
