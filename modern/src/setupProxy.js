const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

// const url = process.env.REACT_APP_URL_NAME;
const url = 'http://127.0.0.1:8082';
const socket_url = 'ws://127.0.0.1:8082';
// const url = 'https://movoauto.com';
// const socket_url = 'wss://movoauto.com';
module.exports = (app) => {
  app.use(createProxyMiddleware('/api/socket', { target: `${socket_url}`, ws: true }));
  app.use(createProxyMiddleware('/api', { target: `${url}` }));
};
