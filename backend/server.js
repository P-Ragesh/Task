const app = require('./app');
const config = require('./config');

const server = app.listen(config.PORT, () => {
  console.log('==================================================');
  console.log(`TaskPilot Enterprise Console Active!`);
  console.log(`API Server running on: http://localhost:${config.PORT}`);
  console.log('==================================================');
});

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection Alert]:', err.message);
  server.close(() => process.exit(1));
});
