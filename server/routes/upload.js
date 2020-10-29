// Ruta para uploads de ficheros
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Importamos el modelo Usuario
const Usuario = require('../models/usuario');

// Importamos el modelo Usuario
const Producto = require('../models/producto');

// Cargamos el middlware verificaToken con destructuracion
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const fs = require('fs'); // paquete nativo node de manejo de ficheros
const path = require('path'); // paquete node para manejo de directorios

// default options
app.use(fileUpload({ useTempFiles: true })); // esto coloca los files en req.files

// definimos la ruta, cambiamos POST por PUT para poder manejar donde van a ir los archivos, si a usuarios, productos, etc
app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // Validamos si viene algún archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningín archivo.'
                }

            });
    }

    // Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) { // no encontró la extensión en el array tiposValidos
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos válidos son: ' + tiposValidos.join(', '),
                tipo,
            }
        });
    }

    // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    // {
    //     name: 'saturn-V-revell.jpg',
    //     data: <Buffer >,
    //     size: 66254,
    //     encoding: '7bit',
    //     tempFilePath: 'C:\\Users\\agust\\OneDrive\\Documentos\\Cursos\\Curso Node de cero a experto\\node\\07-restserver\\tmp\\tmp-1-1603916909952',
    //     truncated: false,
    //     mimetype: 'image/jpeg',
    //     md5: 'cb0221f77b5a9fdc660b778ed621655b',
    //     mv: [Function: mv]
    // }
    // console.log(archivo);

    // Obtenemos la extension del archivo por el nombre, mimetype???
    let nombreSplit = archivo.name.split('.');
    let extension = nombreSplit[nombreSplit.length - 1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // Validamos la extension
    if (extensionesValidas.indexOf(extension) < 0) { // no encontró la extensión en el array extensionesValidas
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones válidas son: ' + extensionesValidas.join(', '),
                ext: extension,
            }
        });
    }

    // Cambiamos el nombre del archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extension }`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Aquí ya se cargó la imagen

        // como solo son 2 tipos vale, si no habría que poner un switch
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });

});

// Funciones
function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        // controlamos el error
        if (err) {
            // Borrado de la imagen subida, para no dejar basura
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            })
        }

        // verificamos que exista el usuario
        if (!usuarioDB) {
            // Borrado de la imagen subida, para no dejar basura
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: `El usuario con id: ${ id },no existe`
                }
            })
        }

        // Borrado de la imagen anterior del usuario, si existe
        borraArchivo(usuarioDB.img, 'usuarios');

        // Actualizamos el campo img del usuario conm nombreArchivo
        usuarioDB.img = nombreArchivo;

        // Guardamos los cambios en MongoDB
        usuarioDB.save((err, usuarioGuardado) => {

            // controlamos el error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo,
            });

        });

    });

};

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        // controlamos el error
        if (err) {
            // Borrado de la imagen subida, para no dejar basura
            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            })
        }

        // verificamos que exista el producto
        if (!productoDB) {
            // Borrado de la imagen subida, para no dejar basura
            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: `El producto con id: ${ id },no existe`
                }
            })
        }

        // Borrado de la imagen anterior del producto, si existe
        borraArchivo(productoDB.img, 'productos');

        // Actualizamos el campo img del producto conm nombreArchivo
        productoDB.img = nombreArchivo;

        // Guardamos los cambios en MongoDB
        productoDB.save((err, productoGuardado) => {

            // controlamos el error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo,
            });

        });

    });


};

function borraArchivo(nombreArchivo, tipo) {

    // verificamos la ruta, a ver si existe:
    let pathArchivo = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreArchivo }`);
    if (fs.existsSync(pathArchivo)) { // el fichdero ima gen existe, lo borramos
        fs.unlinkSync(pathArchivo);
    }

}


module.exports = app;