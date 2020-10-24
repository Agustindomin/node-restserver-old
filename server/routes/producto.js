//==============
// TAREA
//==============

// Cargamos express
const express = require('express');

// Cargamos el middlware verificaToken con destructuracion
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

// Importamos el modelo Producto
const Producto = require('../models/producto');

// Servicios

//================================
// Mostrar todas los productos
//================================
app.get('/producto', verificaToken, (req, res) => {

    // paginacion
    let desde = req.query.desde || 0; // parametro pasado por GET
    desde = Number(desde); // Los transformamos a numero JS o mongo falla

    let limite = req.query.limite || 25; // parametro pasado por GET
    limite = Number(limite); // Los transformamos a numero JS o mongo falla

    Producto.find({ disponible: true }) // Recuperamos todos los registros en MongoDB, solo ciertos campos 
        .skip(desde) // Saltamos los primeros desde registros
        .limit(limite) // ponemos el limit a 5
        //.sort({ nombre: -1 })
        .populate('usuario', 'nombre email') // recuperamos los datos nombre y email del usuario desde la tabla usuarios
        .populate('categoria', 'nombre') // recuperamos el dato nombre de la categoria desde la tabla categorias
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                }); // Si hay un error devolvemos 500 - Internal Server Error
            }

            Producto.countDocuments({ disponible: true }, (err, numRegistros) => {
                res.json({
                    ok: true,
                    productos,
                    numRegistros
                });
            })


        });

});

//================================
// Mostrar una producto por ID
//================================
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id

    Producto.findById(id)
        .populate('usuario', 'nombre email') // recuperamos los datos nombre y email del usuario desde la tabla usuarios
        .populate('categoria', 'nombre') // recuperamos el dato nombre de la categoria desde la tabl
        .exec((err, productoDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                }); // Si hay un error devolvemos 400 - Bad Request
            }

            res.json({
                ok: true,
                productoDB
            });

        });

});

//================================
// Buscar productos
//================================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino; // Recuperamos el termino pasado por la ruta :termino

    // Construimos una REG EXP
    regex = new RegExp(termino, 'i'); // Insensitive

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre') // recuperamos el dato nombre de la categoria desde la tabl
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                }); // Si hay un error devolvemos 500 - Internal Server Error
            }

            res.json({
                ok: true,
                productos
            });

        });

});

//================================
// Crear una nueva producto
//================================
app.post('/producto', verificaToken, (req, res) => {

    // IDUsuario que crea el producto
    // req.usuario._id

    let body = req.body; // recuperamos las variables pasadas por POST

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.descripcion,
        disponible: true,
        usuario: req.usuario._id,
        categoria: body.categoriaID
    }); // Creamos una instancia del modelo Producto

    // Guardamos la producto en la coleccion productos con el metodo save() de mongoose
    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

//================================
// Actualizar una producto por ID
//================================
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id
    // let body = req.body; // recuperamos las variables pasadas por POST

    let body = req.body;

    // Primero verificamos que el producto exista en la BBDD

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        //actualizamos los campos
        productoDB.nombre = body.nombre;
        if (body.precio) {
            productoDB.precioUni = body.precio;
        }
        if (body.descripcion) {
            productoDB.descripcion = body.descripcion;
        }
        if (body.disponible) {
            productoDB.disponible = body.disponible;
        }
        if (body.categoriaID) {
            productoDB.categoria = body.categoriaID;
        }

        productoDB.save((err, productoActualizado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                }); // Si hay un error devolvemos 400 - Bad Request
            }

            res.json({
                ok: true,
                producto: productoActualizado
            });

        });

    });

    // // campos a cambiar
    // let camposActualizar = {
    //     nombre: body.nombre,
    //     descripcion: body.precio,
    //     descripcion: body.descripcion,
    //     usuario: req.usuario._id,
    //     categoria: body.categoriaID
    // };


    // Producto.findByIdAndUpdate(id, camposActualizar, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {

    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         }); // Si hay un error devolvemos 400 - Bad Request
    //     }

    //     if (!productoDB) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         }); // Si hay un error devolvemos 400 - Bad Request
    //     }

    //     res.json({
    //         ok: true,
    //         producto: productoDB
    //     });
    // });

});

//================================
// Borra un producto por ID, poner campo disponible = false
//================================
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id

    // campos a cambiar
    let camposCambiar = {
        disponible: false
    };

    // Marcamos el registro como eliminado usando el campo disponible
    Producto.findByIdAndUpdate(id, camposCambiar, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Error al marcar el Producto ${id} como eliminado`
                }
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        if (!productoBorrado) { // si no existe el producto
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Producto ${id} no encontrado`
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado
        });
    });

});

// //=======================================
// // Borra fisicamente una producto por ID
// //=======================================
// app.delete('/producto/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

//     let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id

//     // Borrado físico del registro en MongoDB
//     Producto.findByIdAndRemove(id, (err, productoBorrada) => {

//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err
//             }); // Si hay un error devolvemos 400 - Bad Request
//         }

//         if (!productoBorrada) { // si no existe el producto
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: `Producto ${id} no encontrada`
//                 }
//             });
//         }

//         res.json({
//             ok: true,
//             producto: productoBorrada
//         });

//     });

// });



//Exportamos el objeto app
module.exports = app;