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