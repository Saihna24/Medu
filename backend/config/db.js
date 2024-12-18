const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool(config.db);

pool.on('connect', () => {
  console.log('Connected to the database');
});

module.exports = pool;
