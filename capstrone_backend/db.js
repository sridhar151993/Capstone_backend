const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'capstrone db',
    password: 'srdr',
    port: 5432
});
module.exports = pool;