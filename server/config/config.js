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
    urlDB = 'mongodb+srv://Fagucito:StVcPRjKm6naQlHW@cluster0.c44pi.mongodb.net/cafe?retryWrites=true&w=majority';
}
process.env.URLDB = urlDB;