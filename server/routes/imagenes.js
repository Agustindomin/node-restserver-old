// Ruta para servir las imagenes uploaded 
const express = require('express');

const fs = require('fs'); // paquete nativo node de manejo de ficheros
const path = require('path'); // paquete node para manejo de directorios

// Cargamos el middleware verificaTokenImg con destructuracion
const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();

// Ruta
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);
    if (fs.existsSync(pathImagen)) { // el fichdero imagen existe, lo enviamos
        res.sendFile(pathImagen);
    } else { // no existe, enviamos no-image.jpg
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }

});





module.exports = app;