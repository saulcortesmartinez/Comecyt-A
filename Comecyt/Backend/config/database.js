<<<<<<< HEAD
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_comecyt',
  waitForConnections: true,
  connectionLimit: 10
});

console.log('✅ [MYSQL] Conectado a bd_comecyt');
=======
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

if (process.env.NODE_ENV === "production") {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

export const pool = new Pool(poolConfig);

// Para que tu código con pool.execute siga funcionando
pool.execute = pool.query;

pool.connect()
  .then(client => {
    console.log('✅ [PG-DB] Conectado exitosamente a PostgreSQL Render');
    client.release();
  })
  .catch(err => {
    console.error('❌ [PG-DB] ERROR DE CONEXIÓN:');
    console.error('❌ Código:', err.code);
    console.error('❌ Mensaje:', err.message);
  });
>>>>>>> b7483f78714a08b1da36c684ff2656ae233c9af4
