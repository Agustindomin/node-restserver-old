// Cargamos express
const express = require('express');

const app = express();

// Pasamos las rutas a /routes/usuario.js
app.use(require('./usuario'));
// Ruta de login
app.use(require('./login'));

module.exports = app;