// routes/alumno.routes.js
import express from "express";
import db from '../config/db.js'; // ✅ agregado para la ruta corregida
import {
  obtenerProgresoAlumno,
  obtenerDatosAlumno,
  obtenerCertificadosAlumno,
  actualizarDatosAlumno,
  cambiarPasswordAlumno,
  registrarAlumno,
  actualizarProgresoContenido,
  obtenerIntentosEvaluacion,
  guardarResultadoEvaluacion,
  reiniciarEvaluacionModulo,
  obtenerContenido
} from "../controllers/alumnoController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware para log
router.use((req, res, next) => {
  console.log(`📍 [ALUMNO] ${req.method} ${req.path}`, req.body);
  next();
});

// Middleware JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// --- RUTAS ---
router.post("/registrar", registrarAlumno);
router.post("/progreso", obtenerProgresoAlumno);
router.get("/progreso", verificarToken, obtenerProgresoAlumno);
router.post("/datos", obtenerDatosAlumno);
router.post("/certificados", obtenerCertificadosAlumno);
router.get("/modulo/:modulo_id/contenido/:numero", verificarToken, obtenerContenido);
router.post("/actualizar", actualizarDatosAlumno);
router.post("/password", cambiarPasswordAlumno);

// --- RUTA DE PROGRESO PARA MYSQL ---
router.post('/progreso/actualizar', async (req, res) => {
  const { correo, modulo_id, contenido_id } = req.body;
  const moduloId = parseInt(modulo_id);
  const contenidoId = parseInt(contenido_id);

  try {
    // 1) marcar contenido como completado
    await db.query(
      `INSERT INTO contenidos_completados (correo, modulo_id, contenido_id)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE fecha_completado = NOW()`,
      [correo, moduloId, contenidoId]
    );

    // 2) contar completados
    const [comp] = await db.query(
      `SELECT COUNT(*) as total FROM contenidos_completados WHERE correo=? AND modulo_id=?`,
      [correo, moduloId]
    );
    const completados = comp[0].total;

    // 3) obtener total del módulo
    const [tot] = await db.query(
      `SELECT total_contenidos FROM MODULO WHERE id_modulo=?`,
      [moduloId]
    );
    const total = tot[0]?.total_contenidos || 8;
    const porcentaje = Math.round((completados / total) * 100);

    // 4) guardar progreso
    await db.query(
      `INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE progreso_actual=?, fecha_actualizacion = NOW()`,
      [correo, moduloId, porcentaje, porcentaje]
    );

    console.log(`✅ Progreso guardado: ${correo} M${moduloId} C${contenidoId} ${porcentaje}% (${completados}/${total})`);
    res.json({ ok: true, porcentaje });
  } catch (e) {
    console.error('❌ Error progreso:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// --- EVALUACIÓN ---
router.post("/evaluacion/intentos", obtenerIntentosEvaluacion);
router.post("/evaluacion/resultado", guardarResultadoEvaluacion);
router.post("/evaluacion/reiniciar", reiniciarEvaluacionModulo);

export default router;