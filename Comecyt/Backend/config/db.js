cat > config/db.js << 'EOF'
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'bd_comecyt',
  waitForConnections: true,
  connectionLimit: 10
});

console.log('✅ [MYSQL] Conectado a bd_comecyt');
export default pool;
EOF