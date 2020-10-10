// Cargamos express
const express = require('express');

// Cargamos bcrypt
const bcrypt = require('bcrypt');

// Cargamos jsonwebtoken JWT
const jwt = require('jsonwebtoken');

// Importamos el modelo Usuario
const Usuario = require('../models/usuario');

const app = express();

// definimos una ruta POST para el login
app.post('/login', (req, res) => {

    let body = req.body;

    // Comprobamos que el email exista en la BBDD Mongo
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 500 - Internal Server Error
        }

        // El email no existe en la BBDD Mongo
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        // Comprobamos si la contrraseña es correcta
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        // Creamos el jwt
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // expire 1 mes

        // El login es valido
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });


    });

});













//Exportamos el objeto app
module.exports = app;