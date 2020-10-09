// Cargamos el config
require('./config/config');

// Cargamos express
const express = require('express');
// Cargamos mongoose
const mongoose = require('mongoose');

const app = express();

// Paquete body-parser para gestionar peticiones post (variables en el body de la petición)
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Pasamos las rutas a /routes/usuario.js
app.use(require('./routes/usuario'));

// Conectamos a mongodb
mongoose.connect(process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    },
    (err, res) => {

        if (err) throw err;

        console.log('Base de datos ONLINE');

    });


// app.listen(3000, () => {
//     console.log('Escuchando el puerto:', 3000);
// });
app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto:', process.env.PORT);
});