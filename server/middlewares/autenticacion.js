// Cargamos jsonwebtoken JWT
const jwt = require('jsonwebtoken');

// ==========================
// Verificar Token
// ==========================
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            }); // Si hay un error devolvemos 400 - Bad Request
        }

        // Si n o hay errores de verificacion es que el token es válido, añadimos la informacfion del usuario al req.
        req.usuario = decoded.usuario;

        next(); // para que ciontinue la ejecución del script

    });


    // console.log(token);
};

// ==========================
// Verifica AdminRole
// ==========================
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next(); // para que continue la ejecución del script
    } else {
        return res.status(403).json({
            ok: false,
            err: {
                message: 'Usuario no es Administrador'
            }
        }); // Si hay un error devolvemos 400 - Bad Request
    }

};

module.exports = {
    verificaToken,
    verificaAdmin_Role
};