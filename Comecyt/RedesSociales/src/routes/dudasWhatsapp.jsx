const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ajusta tu conexión
const { verificarToken, soloAdmin } = require('../middleware/auth'); // Tu middleware

// ✅ GET - Traer todas las dudas
router.get('/dudas-whatsapp', verificarToken, soloAdmin, async (req, res) => {
    try {
        const [dudas] = await db.query(`
      SELECT
        id,
        telefono,
        nombre,
        pregunta,
        modulo,
        fecha,
        estatus,
        respuesta,
        fecha_respuesta
      FROM dudas_whatsapp
      ORDER BY
        CASE estatus
          WHEN 'nueva' THEN 1
          WHEN 'respondida' THEN 2
          ELSE 3
        END,
        fecha DESC
    `);

        console.log('📱 Dudas WhatsApp obtenidas:', dudas.length);
        res.json(dudas);

    } catch (error) {
        console.error('❌ Error al obtener dudas:', error);
        res.status(500).json({ error: 'Error al obtener dudas de WhatsApp' });
    }
});

// ✅ PUT - Responder una duda
router.put('/dudas-whatsapp/:id/responder', verificarToken, soloAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { respuesta } = req.body;

        if (!respuesta || respuesta.trim() === '') {
            return res.status(400).json({ error: 'La respuesta no puede estar vacía' });
        }

        await db.query(`
      UPDATE dudas_whatsapp
      SET
        respuesta =?,
        estatus = 'respondida',
        fecha_respuesta = NOW()
      WHERE id =?
    `, [respuesta, id]);

        console.log('✅ Duda respondida:', id);
        res.json({ success: true, message: 'Duda respondida correctamente' });

    } catch (error) {
        console.error('❌ Error al responder duda:', error);
        res.status(500).json({ error: 'Error al responder duda' });
    }
});

// ✅ PUT - Cerrar una duda
router.put('/dudas-whatsapp/:id/cerrar', verificarToken, soloAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`
      UPDATE dudas_whatsapp
      SET estatus = 'cerrada'
      WHERE id =?
    `, [id]);

        console.log('✅ Duda cerrada:', id);
        res.json({ success: true, message: 'Duda cerrada' });

    } catch (error) {
        console.error('❌ Error al cerrar duda:', error);
        res.status(500).json({ error: 'Error al cerrar duda' });
    }
});

// ✅ POST - Insertar duda desde webhook de WhatsApp
router.post('/dudas-whatsapp', async (req, res) => {
    try {
        const { telefono, pregunta, nombre } = req.body;

        if (!telefono || !pregunta) {
            return res.status(400).json({ error: 'Teléfono y pregunta son requeridos' });
        }

        const [result] = await db.query(`
      INSERT INTO dudas_whatsapp (telefono, pregunta, nombre, modulo, estatus)
      VALUES (?,?,?, '/whatsapp', 'nueva')
    `, [telefono, pregunta, nombre || 'Usuario WhatsApp']);

        console.log('✅ Nueva duda insertada:', result.insertId);
        res.json({ success: true, id: result.insertId });

    } catch (error) {
        console.error('❌ Error al insertar duda:', error);
        res.status(500).json({ error: 'Error al guardar duda' });
    }
});

module.exports = router;