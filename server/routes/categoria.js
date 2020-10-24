//==============
// TAREA
//==============

// Cargamos express
const express = require('express');

// Cargamos el middlware verificaToken con destructuracion
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

// Importamos el modelo Categoria
const Categoria = require('../models/categoria');

// Servicios

//================================
// Mostrar todas las categorias
//================================
app.get('/categoria', verificaToken, (req, res) => {

    let desde = req.query.desde || 0; // parametro pasado por GET
    desde = Number(desde); // Los transformamos a numero JS o mongo falla

    let limite = req.query.limite || 25; // parametro pasado por GET
    limite = Number(limite); // Los transformamos a numero JS o mongo falla

    Categoria.find({}) // Recuperamos todos los registros en MongoDB, solo ciertos campos 
        // .skip(desde) // Saltamos los primeros desde registros
        // .limit(limite) // ponemos el limit a 5
        .sort({ nombre: -1 })
        .populate('usuario', 'nombre email') // recuperamos los datos nombre y email del usuario desde la tabla usuarios
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                }); // Si hay un error devolvemos 400 - Bad Request
            }

            Categoria.countDocuments({}, (err, numRegistros) => {
                res.json({
                    ok: true,
                    categorias,
                    numRegistros
                });
            })


        });

});

//================================
// Mostrar una categoria por ID
//================================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        res.json({
            ok: true,
            categoriaDB
        });

    });

});

//================================
// Crear una nueva categoria
//================================
app.post('/categoria', [verificaToken, verificaAdmin_Role], (req, res) => {

    // IDCategoria que crea la categoria
    // req.usuario._id

    let body = req.body; // recuperamos las variables pasadas por POST

    let categoria = new Categoria({
        nombre: body.nombre,
        usuario: req.usuario._id,
    }); // Creamos una instancia del modelo Categoria

    // Guardamos la categoria en la coleccion categorias con el metodo save() de mongoose
    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

//================================
// Actualizar una categoria por ID
//================================
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id
    // let body = req.body; // recuperamos las variables pasadas por POST

    let body = req.body;
    console.log(body);

    Categoria.findByIdAndUpdate(id, { nombre: body.nombre }, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

//=======================================
// Borra fisicamente una categoria por ID
//=======================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id; // Recuperamos el id pasado por parámetro de la ruta :id

    // Borrado físico del registro en MongoDB
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        if (!categoriaBorrada) { // si no existe el categoria
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Categoria ${id} no encontrada`
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });

    });

});



//Exportamos el objeto app
module.exports = app;