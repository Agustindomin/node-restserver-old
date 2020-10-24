// Cargamos express
const express = require('express');

const app = express();

// Pasamos las rutas a /routes/usuario.js
app.use(require('./usuario'));
// Ruta de login
app.use(require('./login'));
// Ruta de categorias
app.use(require('./categoria'));
// Ruta de productos
app.use(require('./producto'));

module.exports = app;