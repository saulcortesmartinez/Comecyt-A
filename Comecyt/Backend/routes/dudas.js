import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET /api/whatsapp-panel
router.get('/whatsapp-panel', async (req, res) => {
    try {
        console.log('📱 [DUDAS] Consultando tabla dudas_whatsapp...');

        const [dudas] = await pool.query(`
      SELECT
        id,
        DATE_FORMAT(fecha, '%d/%m/%Y %H:%i') as fecha,
        telefono,
        nombre,
        pregunta,
        estatus,
        modulo
      FROM dudas_whatsapp
      ORDER BY fecha DESC
    `);

        console.log(`✅ [DUDAS] Encontradas: ${dudas.length} registros`);
        res.json(dudas);

    } catch (error) {
        console.error('💥 [DUDAS] Error SQL:', error.message);
        res.status(500).json({
            error: 'Error al consultar dudas',
            details: error.message
        });
    }
});

export default router;