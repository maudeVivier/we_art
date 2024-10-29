require('dotenv').config(); // Charger les variables d'environnement
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
//--------------    décommenter ces lignes suivants si veux tourner en local
    ssl: {
        rejectUnauthorized: false  // Autorise les certificats auto-signés (utile pour certaines configurations)
    }
//--------------
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        client.query('SELECT NOW()', (err, result) => {
            release();
            if (err) {
                console.error('Error executing query', err.stack);
            } else {
                console.log(result.rows);
            }
        });
    }
});

module.exports = pool;
