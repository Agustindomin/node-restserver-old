// ==========================
// Puerto
// ==========================
// Usamos el objeto global process
process.env.PORT = process.env.PORT || 3000; // si no tiene un puerto, como en local, le ponemos 3000

// ==========================
// Entorno
// ==========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==========================
// Vencimiento del Token
// ==========================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = '48h'; //60 * 60 * 24 * 30;

// ==========================
// SEED de Autenticación
// ==========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ==========================
// Base de datos Mongo
// ==========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

// ==========================
// Google Client ID
// ==========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '31545124064-3mn7epros049svn3408t0pqfqlbrr4pv.apps.googleusercontent.com';