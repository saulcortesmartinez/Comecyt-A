import { pool } from "../config/database.js";

export const getModulos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM MODULO");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
