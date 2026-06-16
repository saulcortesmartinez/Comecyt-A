import express from "express";
import {
  obtenerDatosDocente,
  actualizarDatosDocente,
  cambiarPasswordDocente,
  obtenerDashboardResumen,
  listarAlumnosDocente,
  actualizarAlumnoDocente,
  obtenerTop5Calificaciones,
  listarCalificaciones,
  listarCertificados,
} from "../controllers/docenteController.js";

const router = express.Router();

router.post("/datos", obtenerDatosDocente);
router.put("/actualizar", actualizarDatosDocente);
router.put("/password", cambiarPasswordDocente);
router.get("/dashboard-resumen", obtenerDashboardResumen);

// Alumnos y Usuarios
router.get("/usuarios", listarAlumnosDocente);
router.put("/usuarios/:id", actualizarAlumnoDocente);

// Calificaciones
router.get("/calificaciones/top5", obtenerTop5Calificaciones);
router.get("/calificaciones", listarCalificaciones);

// Certificados
router.get("/certificados", listarCertificados);

export default router;
