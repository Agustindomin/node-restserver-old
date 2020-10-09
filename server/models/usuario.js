// Cargamos mongoose
const mongoose = require('mongoose');

// definimos el objeto Schema de mongoose
const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;
const uniqueValidator = require('mongoose-unique-validator'); // validador de uniques

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El Email es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Modificamos el método nativo .toJSON, para no devolver nunca el campo password
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();

    // Borramos del método toJSON el campo password
    delete userObject.password;

    return userObject;
};

// Apply the uniqueValidator plugin to userSchema.
usuarioSchema.plugin(uniqueValidator, { message: 'Error, {PATH} debe de ser único' });

// Exportamos el modelo usuario
module.exports = mongoose.model('usuario', usuarioSchema);