const {Pool} = require('pg');

const pool = new Pool({
  user: 'myUser',
  host: 'db',
  database: 'myDatabase',
  password: 'myPassword',
  port: 5432,
});

module.exports = { pool };
