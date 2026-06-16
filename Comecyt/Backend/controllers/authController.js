import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

dotenv.config();

export const loginUser = async (req, res) => {
  const { correo, contraseña } = req.body;
  console.log('🔥 [LOGIN] Intentando login:', correo);

  if (!correo || !contraseña) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  try {
    let user = null;

    // 1. DOCENTE
    const [docentes] = await pool.query(
      `SELECT docente_id as id, nombre, apellido, correo, contraseña, 'docente' as rol FROM DOCENTE WHERE correo =?`,
      [correo]
    );
    console.log('🔥 [LOGIN] Docentes encontrados:', docentes.length);

    if (docentes.length > 0) {
      user = docentes[0];
    }

    // 2. ADMINISTRADOR - usa 'usuario'
    if (!user) {
      const [admins] = await pool.query(
        `SELECT admin_id as id, nombre, apellido, usuario as correo, contraseña, 'admin' as rol FROM ADMINISTRADOR WHERE usuario =?`,
        [correo]
      );
      console.log('🔥 [LOGIN] Admins encontrados:', admins.length);
      if (admins.length > 0) {
        user = admins[0];
      }
    }

    // 3. ALUMNO
    if (!user) {
      const [alumnos] = await pool.query(
        `SELECT alumno_id as id, nombre, apellido, correo, contraseña, 'alumno' as rol FROM ALUMNO WHERE correo =?`,
        [correo]
      );
      console.log('🔥 [LOGIN] Alumnos encontrados:', alumnos.length);
      if (alumnos.length > 0) {
        user = alumnos[0];
      }
    }

    if (!user) {
      console.log('❌ [LOGIN] Usuario no encontrado');
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    console.log('🔥 [LOGIN] Password válida:', validPassword, 'rol:', user.rol);

    if (!validPassword) {
      console.log('❌ [LOGIN] Contraseña incorrecta');
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.rol, correo: user.correo },
      process.env.JWT_SECRET || "secreto_temporal",
      { expiresIn: "24h" }
    );

    console.log('✅ [LOGIN] Login exitoso como', user.rol);

    return res.json({
      token,
      role: user.rol,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo
      },
      // Compatibilidad para el nuevo Inicio
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('💥 [LOGIN] ERROR:', error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const loginDocente = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    const [rows] = await pool.query(
      "SELECT docente_id, nombre, apellido, correo, contraseña FROM DOCENTE WHERE correo =?",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    const docente = rows[0];
    const validPassword = await bcrypt.compare(contraseña, docente.contraseña);

    if (!validPassword) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id: docente.docente_id, role: "docente", correo: docente.correo },
      process.env.JWT_SECRET || "secreto_temporal",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      role: "docente",
      docente: {
        docente_id: docente.docente_id,
        nombre: docente.nombre,
        apellido: docente.apellido,
        correo: docente.correo,
        rol: "docente"
      },
      // Compatibilidad para el nuevo Inicio
      usuario: {
        id: docente.docente_id,
        nombre: docente.nombre,
        apellido: docente.apellido,
        correo: docente.correo,
        rol: "docente"
      }
    });

  } catch (error) {
    console.error("💥 [LOGIN DOCENTE] ERROR:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ===== REGISTRO - CON PROGRESO AUTOMÁTICO =====
export const registro = async (req, res) => {
  const { nombre, apellido, correo, contraseña, rol } = req.body;
  console.log(`\n🚀 [REGISTRO AUTH] INICIO para: ${correo}, rol: ${rol || 'alumno'}`);

  if (!nombre || !apellido || !correo || !contraseña) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    let result;
    const correoNorm = correo.toLowerCase().trim();

    if (rol === 'docente') {
      [result] = await pool.query(
        'INSERT INTO DOCENTE (nombre, apellido, correo, contraseña) VALUES (?,?,?,?)',
        [nombre.trim(), apellido.trim(), correoNorm, hashedPassword]
      );
    } else if (rol === 'admin') {
      [result] = await pool.query(
        'INSERT INTO ADMINISTRADOR (nombre, apellido, usuario, contraseña) VALUES (?,?,?,?)',
        [nombre.trim(), apellido.trim(), correoNorm, hashedPassword]
      );
    } else {
      // ALUMNO
      [result] = await pool.query(
        'INSERT INTO ALUMNO (nombre, apellido, correo, contraseña) VALUES (?,?,?,?)',
        [nombre.trim(), apellido.trim(), correoNorm, hashedPassword]
      );

      console.log(`✅ [REGISTRO AUTH] Alumno creado: ID=${result.insertId}`);

      // ✅ CREA PROGRESO INICIAL PARA TODOS LOS MÓDULOS EN 0
      const [modulos] = await pool.query("SELECT modulo_id FROM MODULO ORDER BY modulo_id ASC");
      console.log(`🔍 [REGISTRO AUTH] Módulos encontrados: ${modulos.length}`);

      if (modulos.length > 0) {
        const valoresProgreso = modulos.map(mod => [correoNorm, mod.modulo_id, 0]);
        try {
          const [insertResult] = await pool.query(
            "INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual) VALUES?",
            [valoresProgreso]
          );
          console.log(`✅ [REGISTRO AUTH] SUCCESS: ${insertResult.affectedRows} registros de progreso creados para ${correoNorm}`);
        } catch (insertErr) {
          console.error(`💥 [REGISTRO AUTH] ERROR progreso_modulos:`, insertErr.message);
        }
      }
    }

    res.status(201).json({
      mensaje: `${rol || 'alumno'} registrado correctamente`,
      id: result.insertId,
      rol: rol || 'alumno'
    });

  } catch (error) {
    console.error("💥 [REGISTRO AUTH] ERROR:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "El correo/usuario ya está registrado" });
    }
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const getAdminData = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT admin_id as id, nombre, apellido, usuario as correo, 'admin' as rol FROM ADMINISTRADOR WHERE admin_id =?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos" });
  }
};

export const updateAdminData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellido, correo } = req.body;

    if (!nombre || !apellido || !correo) {
      return res.status(400).json({ error: "Nombre, apellido y correo son obligatorios" });
    }

    const [existe] = await pool.query(
      `SELECT admin_id FROM ADMINISTRADOR WHERE usuario =? AND admin_id!=?`,
      [correo, userId]
    );

    if (existe.length > 0) return res.status(400).json({ error: "Ese usuario ya está en uso" });

    await pool.query(
      `UPDATE ADMINISTRADOR SET nombre =?, apellido =?, usuario =? WHERE admin_id =?`,
      [nombre, apellido, correo, userId]
    );

    const [rows] = await pool.query(
      `SELECT admin_id as id, nombre, apellido, usuario as correo, 'admin' as rol FROM ADMINISTRADOR WHERE admin_id =?`,
      [userId]
    );

    res.json({ message: "Datos actualizados", user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar datos" });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contraseña_actual, contraseña_nueva } = req.body;

    if (!contraseña_actual || !contraseña_nueva) {
      return res.status(400).json({ error: "Contraseña actual y nueva son obligatorias" });
    }

    const [rows] = await pool.query(
      `SELECT contraseña FROM ADMINISTRADOR WHERE admin_id =?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(contraseña_actual, rows[0].contraseña);

    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(contraseña_nueva, 10);

    await pool.query(
      `UPDATE ADMINISTRADOR SET contraseña =? WHERE admin_id =?`,
      [hashedPassword, userId]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar contraseña" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [alumnos] = await pool.query(
      `SELECT alumno_id as id, nombre, apellido, correo, 'alumno' as rol FROM ALUMNO`
    );
    const [docentes] = await pool.query(
      `SELECT docente_id as id, nombre, apellido, correo, 'docente' as rol FROM DOCENTE`
    );
    const [admins] = await pool.query(
      `SELECT admin_id as id, nombre, apellido, usuario as correo, 'admin' as rol FROM ADMINISTRADOR`
    );

    const todos = [...alumnos, ...docentes, ...admins].sort((a, b) => b.id - a.id);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const adminId = req.user.id;

    if (parseInt(id) === adminId && rol === 'admin') {
      return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
    }

    let tabla = 'ALUMNO';
    let campo = 'alumno_id';

    if (rol === 'docente') {
      tabla = 'DOCENTE';
      campo = 'docente_id';
    } else if (rol === 'admin') {
      tabla = 'ADMINISTRADOR';
      campo = 'admin_id';
    }

    const [result] = await pool.query(`DELETE FROM ${tabla} WHERE ${campo} =?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};