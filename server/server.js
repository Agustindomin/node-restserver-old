// Cargamos el config
require('./config/config');

const express = require('express');
const app = express();

// Paquete body-parser para gestionar peticiones post (variables en el body de la petición)
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/usuario', function(req, res) {
    // res.send('Hello World');
    res.json('GET Usuario');
});

app.post('/usuario', function(req, res) {

    let body = req.body;

    if (body.nombre === undefined) {

        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        }); // Si no viene el nombre devolvemos 400 - Bad Rsequest

    } else {
        res.json({
            'persona': body
        });
    }

});

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;

    res.json({
        id
    });
});

app.delete('/usuario', function(req, res) {
    res.json('DELETE Usuario');
});

// app.listen(3000, () => {
//     console.log('Escuchando el puerto:', 3000);
// });
app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto:', process.env.PORT);
});