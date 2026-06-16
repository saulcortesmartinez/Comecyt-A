import bcrypt from "bcryptjs";
import { pool } from "./config/database.js";

async function insertarUsuariosEjemplo() {
  try {
    const passAdmin = await bcrypt.hash("admin123", 10);
    const passDocente = await bcrypt.hash("docente123", 10);
    const passAlumno = await bcrypt.hash("alumno123", 10);

    await pool.query(
      "INSERT INTO ADMINISTRADOR (usuario, contraseña) VALUES (?, ?)",
      ["admin", passAdmin]
    );

    await pool.query(
      "INSERT INTO DOCENTE (nombre, apellido, contraseña, correo) VALUES (?, ?, ?, ?)",
      ["Fer", "Primo", passDocente, "fer.primo@ejemplo.com"]
    );

    await pool.query(
      `INSERT INTO ALUMNO 
        (nombre, apellido, contraseña, correo, progreso_m1, progreso_m2, progreso_m3) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Juan", "Pérez", passAlumno, "juan.perez@ejemplo.com", 0, 0, 0]
    );

    console.log("✅ Usuarios insertados correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error insertando usuarios:", error);
    process.exit(1);
  }
}

insertarUsuariosEjemplo();
