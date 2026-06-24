import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";

const CONTENIDOS_POR_MODULO = { 1:8, 2:6, 3:7, 4:8, 5:16 };

// ===== REGISTRO =====
export const registrarAlumno = async (req, res) => {
  const { nombre, apellido, correo, contraseña } = req.body;
  try {
    const hashed = await bcrypt.hash(contraseña, 10);
    const result = await pool.query(
      "INSERT INTO alumno (nombre, apellido, correo, contraseña) VALUES ($1,$2,$3,$4) RETURNING alumno_id",
      [nombre.trim(), apellido.trim(), correo.toLowerCase().trim(), hashed]
    );

    const alumno_id = result.rows[0].alumno_id;

    // Crear progreso inicial
    const modulos = await pool.query("SELECT modulo_id FROM modulo ORDER BY modulo_id");
    for (let mod of modulos.rows) {
      await pool.query(
        "INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual) VALUES ($1,$2,0) ON CONFLICT (correo, modulo_id) DO NOTHING",
        [correo, mod.modulo_id]
      );
    }

    res.status(201).json({ mensaje: "Alumno registrado", alumno_id, correo });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "Correo ya registrado" });
    res.status(500).json({ error: err.message });
  }
};

// ===== PROGRESO =====
export const obtenerProgresoAlumno = async (req, res) => {
  try {
    const { correo } = req.body;
    const alumno = await pool.query("SELECT * FROM alumno WHERE correo = $1", [correo]);
    if (!alumno.rows.length) return res.status(404).json({ error: "Alumno no encontrado" });

    const progresos = await pool.query(
      "SELECT modulo_id, progreso_actual FROM progreso_modulos WHERE correo = $1",
      [correo]
    );

    const modulos = await pool.query("SELECT * FROM modulo ORDER BY modulo_id");
    const resultados = modulos.rows.map(mod => {
      const prog = progresos.rows.find(p => p.modulo_id === mod.modulo_id);
      const actual = prog?.progreso_actual || 0;
      const total = CONTENIDOS_POR_MODULO[mod.modulo_id] || 1;
      return {
        modulo_id: mod.modulo_id,
        titulo_modulo: mod.titulo,
        progreso_actual: actual,
        total_contenidos: total,
        porcentaje: Math.min(Math.round((actual/total)*100),100),
        completado: actual >= total
      };
    });

    res.json({ alumno: alumno.rows[0], modulos: resultados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== ✅ CORREGIDO PARA POSTGRESQL =====
export const actualizarProgresoContenido = async (req, res) => {
  const { correo, modulo_id, contenido_id } = req.body;
  try {
    // 1. Obtener alumno_id
    const alumno = await pool.query('SELECT alumno_id FROM alumno WHERE correo = $1', [correo]);
    if (!alumno.rows.length) return res.status(404).json({ error: 'Alumno no encontrado' });

    const alumno_id = alumno.rows[0].alumno_id;

    // 2. Insertar contenido completado (PostgreSQL)
    await pool.query(
      `INSERT INTO contenidos_completados (alumno_id, modulo_id, contenido_id, fecha_completado)
       VALUES ($1,$2,$3,NOW())
       ON CONFLICT (alumno_id, modulo_id, contenido_id) DO NOTHING`,
      [alumno_id, modulo_id, contenido_id]
    );

    // 3. Contar
    const count = await pool.query(
      'SELECT COUNT(*) as count FROM contenidos_completados WHERE alumno_id=$1 AND modulo_id=$2',
      [alumno_id, modulo_id]
    );
    const nuevoProgreso = parseInt(count.rows[0].count);

    // 4. Actualizar progreso
    await pool.query(
      `INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual)
       VALUES ($1,$2,$3)
       ON CONFLICT (correo, modulo_id) DO UPDATE SET progreso_actual = $3`,
      [correo, modulo_id, nuevoProgreso]
    );

    res.json({ success: true, progreso_actual: nuevoProgreso });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===== RESTO DE FUNCIONES (simplificadas para PostgreSQL) =====
export const obtenerDatosAlumno = async (req, res) => {
  const { correo } = req.body;
  const result = await pool.query("SELECT alumno_id, nombre, apellido, correo FROM alumno WHERE correo=$1", [correo]);
  res.json({ alumno: result.rows[0] });
};

export const actualizarDatosAlumno = async (req, res) => {
  const { alumno_id, nombre, apellido } = req.body;
  await pool.query("UPDATE alumno SET nombre=$1, apellido=$2 WHERE alumno_id=$3", [nombre, apellido, alumno_id]);
  res.json({ mensaje: "Actualizado" });
};

export const cambiarPasswordAlumno = async (req, res) => {
  const { alumno_id, nueva_contrasena } = req.body;
  const hashed = await bcrypt.hash(nueva_contrasena, 10);
  await pool.query("UPDATE alumno SET contraseña=$1 WHERE alumno_id=$2", [hashed, alumno_id]);
  res.json({ mensaje: "Contraseña actualizada" });
};

export const obtenerCertificadosAlumno = async (req, res) => {
  const { correo } = req.body;
  const result = await pool.query(`
    SELECT c.certificado_id, m.titulo, c.fecha_emision
    FROM certificado c
    JOIN alumno a ON c.alumno_id = a.alumno_id
    JOIN modulo m ON c.modulo_id = m.modulo_id
    WHERE a.correo=$1`, [correo]);
  res.json({ certificados: result.rows });
};

export const obtenerIntentosEvaluacion = async (req, res) => {
  const { correo, evaluacion_id } = req.body;
  const alumno = await pool.query("SELECT alumno_id FROM alumno WHERE correo=$1", [correo]);
  const result = await pool.query("SELECT puntaje FROM resultado WHERE alumno_id=$1 AND evaluacion_id=$2", [alumno.rows[0].alumno_id, evaluacion_id]);
  res.json({ intentos: result.rows.length, max_puntaje: Math.max(...result.rows.map(r=>r.puntaje),0) });
};

export const guardarResultadoEvaluacion = async (req, res) => {
  const { correo, evaluacion_id, puntaje } = req.body;
  const alumno = await pool.query("SELECT alumno_id FROM alumno WHERE correo=$1", [correo]);
  await pool.query("INSERT INTO resultado (evaluacion_id, alumno_id, puntaje, fecha) VALUES ($1,$2,$3,NOW())", [evaluacion_id, alumno.rows[0].alumno_id, puntaje]);
  res.json({ mensaje: "Guardado" });
};

export const reiniciarEvaluacionModulo = async (req, res) => {
  const { correo, evaluacion_id } = req.body;
  const alumno = await pool.query("SELECT alumno_id FROM alumno WHERE correo=$1", [correo]);
  await pool.query("DELETE FROM resultado WHERE alumno_id=$1 AND evaluacion_id=$2", [alumno.rows[0].alumno_id, evaluacion_id]);
  res.json({ message: "Reiniciado" });
};

export const obtenerContenido = async (req, res) => {
  const { correo } = req.user;
  const { modulo_id, numero } = req.params;

  if (parseInt(numero) === 1) {
    const cont = await pool.query("SELECT * FROM contenido WHERE modulo_id=$1 AND numero=$2", [modulo_id, numero]);
    return res.json(cont.rows[0]);
  }

  const alumno = await pool.query('SELECT alumno_id FROM alumno WHERE correo=$1', [correo]);
  const anterior = await pool.query(
    'SELECT 1 FROM contenidos_completados WHERE alumno_id=$1 AND modulo_id=$2 AND contenido_id=$3',
    [alumno.rows[0].alumno_id, modulo_id, parseInt(numero)-1]
  );

  if (!anterior.rows.length) return res.status(403).json({ error: 'Bloqueado' });

  const cont = await pool.query("SELECT * FROM contenido WHERE modulo_id=$1 AND numero=$2", [modulo_id, numero]);
  res.json(cont.rows[0]);
};