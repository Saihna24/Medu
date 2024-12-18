const pool = require('../config/db');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      firstname VARCHAR(255),
      lastname VARCHAR(255),
      role VARCHAR(50) NOT NULL
    )
  `;
  await pool.query(query);
};

createUsersTable().catch((err) => console.error(err));
