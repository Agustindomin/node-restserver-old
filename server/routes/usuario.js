// Cargamos express
const express = require('express');
const app = express();

// Cargamos bcrypt
const bcrypt = require('bcrypt');

// Cargamos underscore
const _ = require('underscore');

// Importamos el modelo Usuario
const Usuario = require('../models/usuario');
// Cargamos el middlware verificaToken con destructuracion
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, (req, res) => {
    // // res.send('Hello World');
    // res.json(`GET Usuario${process.env.PORT==3000 ? ' LOCAL' : ''}`);

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    let desde = req.query.desde || 0; // parametro pasado por GET
    desde = Number(desde); // Los transformamos a numero JS o mongo falla

    let limite = req.query.limite || 5; // parametro pasado por GET
    limite = Number(limite); // Los transformamos a numero JS o mongo falla

    Usuario.find({ estado: true }, 'nombre email estado google role img') // Recuperamos todos los registros en MongoDB, solo ciertos campos 
        .skip(desde) // Saltamos los primeros desde registros
        .limit(limite) // ponemos el limit a 5
        //.sort({ nombre: 0 }) // ponemos el orden
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                }); // Si hay un error devolvemos 400 - Bad Request
            }

            Usuario.countDocuments({ estado: true }, (err, numRegistros) => {
                res.json({
                    ok: true,
                    usuarios,
                    numRegistros
                });
            })


        });

});

app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {

    let body = req.body; // recuperamos las variables pasadas por POST

    // if (body.nombre === undefined) {
    //     return res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     }); // Si no viene el nombre devolvemos 400 - Bad Rsequest
    // }
    // } else {
    //     return res.json({
    //         'persona': body
    //     });
    // }

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    }); // Creamos una instancia del modelo Usuario

    // Guardamos el usuario en la coleccion usuarios con el metodo save() de  mongoose
    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        // Quitamos el password de la respuesta
        // usuarioDB.password = null; // Ahora lo hacemos quitando el campo password del metodo .toJSON del objeto usuario

        res.json({
            'usuario': usuarioDB
        });

    });

});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id
    // let body = req.body; // recuperamos las variables pasadas por POST

    // // Para campos que no queremos actualizar nunca con este método (password, google, etc) podemos hacer:
    // delete body.password;
    // delete body.google;
    // El problema es que si tenemos muchos campos y objetos es muy ineficiente, por eso usamos la libreria underscore.js

    let body = _.pick(req.body, ['nombre', 'email', 'img', , 'role', 'estado']);

    // Usuario.findById(id, (err, usuarioDB) => {
    //     usuarioDB.save;
    // });
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});

// // DELETE fisico del registro en la BBDD
// app.delete('/usuario/:id', function(req, res) {

//     let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id

//     // Borrado físico del registro en MongoDB
//     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err
//             }); // Si hay un error devolvemos 400 - Bad Request
//         }

//         if (!usuarioBorrado) { // si no existe el usuario
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: `Usuario ${id} no encontrado`
//                 }
//             });
//         }

//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });

//     });

//     // res.json('DELETE Usuario');
// });

// TAREA 
// MARCAR DELETE en el mismo registro en la BBDD
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id

    // campos a cambiar
    let camposCambiar = {
        estado: false
    };

    // Marcamos el registro como eliminado usando el campo estado
    Usuario.findByIdAndUpdate(id, camposCambiar, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Error al marcar el Usuario ${id} como eliminado`
                }
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        if (!usuarioBorrado) { // si no existe el usuario
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Usuario ${id} no encontrado`
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });


    // res.json('DELETE Usuario');
});


//Exportamos el objeto app
module.exports = app;