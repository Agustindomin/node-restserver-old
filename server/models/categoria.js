// Cargamos mongoose
const mongoose = require('mongoose');

// definimos el objeto Schema de mongoose
const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;
const uniqueValidator = require('mongoose-unique-validator'); // validador de uniques

let Usuario = require('./usuario') // Cargo el modelo de usuario

const categoriaSchema = new Schema({
    nombre: {
        type: String,
        unique: true,
        required: [true, 'El nombre es necesario']
    },
    usuario: {
        type: String,
        required: [true, 'El usuario es necesario'],
        ref: Usuario //Hago referencia al modelo usuario para que funcione populate
    },
    estado: {
        type: Boolean,
        default: true
    }
});

// Apply the uniqueValidator plugin to userSchema.
categoriaSchema.plugin(uniqueValidator, { message: 'Error, {PATH} debe de ser único' });

// Exportamos el modelo categoria
module.exports = mongoose.model('categoria', categoriaSchema);