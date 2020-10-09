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
// Base de datos Mongo
// ==========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;