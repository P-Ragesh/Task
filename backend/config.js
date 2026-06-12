const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'taskpilot_enterprise_secure_token_secret_key_2026',
  JWT_EXPIRY: '24h',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, 'database.db')
};
