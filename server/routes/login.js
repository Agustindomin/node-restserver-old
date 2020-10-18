// Cargamos express
const express = require('express');

// Cargamos bcrypt
const bcrypt = require('bcrypt');

// Cargamos jsonwebtoken JWT
const jwt = require('jsonwebtoken');

// Cargamos librerias de Google Autentication Token
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


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

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    // retornamos lod datos del usuario de google
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
// verify().catch(console.error);

// definimos una ruta POST para el Google login
app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    // Verificamos los datos del usuario de google
    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                err: e
            });
        });

    // Comprobamos que el email del usuario Google exista en la BBDD Mongo
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 500 - Internal Server Error
        }

        // El usuario existe en la BBDD Mongo
        if (usuarioDB) {

            if (usuarioDB.google === false) { // Es un usuario de autenticacion normal
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticacion normal'
                    }
                });
            } else { // Es un usuario autenticado por google, renovamos su token
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
            }

        } else {
            // El usuario no existe en la BBDD MoingoDB, lo creamos
            let usuario = new Usuario();

            // asignamos las propiedades
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; // porqwuer es requerido por el modelo Usuario

            // Creamos el usuario
            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    }); // Si hay un error devolvemos 500 - Internal Server Error
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
        }






    });
    // res.json({
    //     usuario: googleUser
    // });

});










//Exportamos el objeto app
module.exports = app;