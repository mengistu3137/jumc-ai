'use strict';
const mysql = require('mysql2/promise');

/**
 * Shared MySQL connection pool.
 * All modules import this singleton — no duplicate connections.
 */
const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             parseInt(process.env.DB_PORT) || 3306,
  database:         process.env.DB_NAME     || 'jumc_hospital',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  enableKeepAlive:  true,
});

module.exports = { pool };
