import { pool } from "../config/database.js";

export const getModulos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "MODULO" ORDER BY modulo_id');
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
