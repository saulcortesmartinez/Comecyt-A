import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de MySQL para Clever Cloud
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Función auxiliar para manejar INSERT IGNORE que MySQL sí soporta
const originalQuery = pool.query.bind(pool);
pool.query = async function(sql, values) {
  let queryText = sql;
  let queryParams = values;
  
  if (typeof sql === "object" && sql !== null) {
    queryText = sql.text;
    queryParams = sql.values;
  }

  console.log(`[MYSQL-DB] Ejecutando: ${queryText.substring(0, 100)}...`);
  if (queryParams && queryParams.length > 0) {
    console.log(`[MYSQL-DB] Parámetros:`, queryParams);
  }

  return originalQuery(queryText, queryParams);
};

// Método execute para compatibilidad
pool.execute = pool.query;

// Probar conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log('✅ [MYSQL-DB] Conectado exitosamente a Clever Cloud');
    connection.release();
  })
  .catch(err => {
    console.error('❌ [MYSQL-DB] ERROR DE CONEXIÓN:');
    console.error('❌ Código:', err.code);
    console.error('❌ Mensaje:', err.message);
    console.error('❌ Revisa tus variables DB_HOST, DB_USER, DB_PASS, DB_NAME en Render');
  });
