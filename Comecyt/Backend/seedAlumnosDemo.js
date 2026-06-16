// seedAlumnosDemo.js
import bcrypt from "bcryptjs";
import { pool } from "./config/database.js";

async function insertarAlumnosDemo() {
  try {
    const passPlano = "alumno123";
    const passHash = await bcrypt.hash(passPlano, 10);

    // progreso_m1: escala 0–29 (29 = 100%)
    const alumnos = [
      ["Juan",     "Pérez",      "juan.perez@ejemplo.com",       27],
      ["Ana",      "López",      "ana.lopez@ejemplo.com",        24],
      ["Fernanda", "Aguilar",    "fernanda.aguilar@ejemplo.com", 15],
      ["Carlos",   "Ruiz",       "carlos.ruiz@ejemplo.com",       5],
      ["María",    "Torres",     "maria.torres@ejemplo.com",     18],
      ["Luis",     "Hernández",  "luis.hernandez@ejemplo.com",   29],
      ["Daniela",  "Flores",     "daniela.flores@ejemplo.com",   22],
      ["Ricardo",  "Gómez",      "ricardo.gomez@ejemplo.com",    10],
      ["Sofía",    "Ramírez",    "sofia.ramirez@ejemplo.com",     8],
      ["Miguel",   "Sánchez",    "miguel.sanchez@ejemplo.com",    2],
    ];

    for (const [nombre, apellido, correo, progreso_m1] of alumnos) {
      // INSERT IGNORE para no tronar si el correo ya existe (UNIQUE)
      await pool.query(
        `INSERT IGNORE INTO ALUMNO 
           (nombre, apellido, contraseña, correo, progreso_m1, progreso_m2, progreso_m3)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, passHash, correo, progreso_m1, 0, 0]
      );
    }

    console.log("✅ Alumnos demo insertados.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error insertando alumnos demo:", error);
    process.exit(1);
  }
}

insertarAlumnosDemo();
