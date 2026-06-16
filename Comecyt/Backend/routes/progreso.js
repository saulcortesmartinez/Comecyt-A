// routes/progreso.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
        req.user = decoded; // { correo, id, role }
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// ✅ OBTENER PROGRESO - POST para compatibilidad
router.post('/', async (req, res) => {
    const { correo } = req.body;
    console.log('📥 [PROGRESO] Pidiendo progreso para:', correo);

    try {
        // Regresa solo el conteo de completados por módulo
        const [progresos] = await db.query(`
      SELECT
        m.modulo_id,
        COUNT(cc.contenido_id) as progreso_actual,
        m.total_contenidos
      FROM MODULO m
      LEFT JOIN contenidos_completados cc
        ON cc.modulo_id = m.modulo_id AND cc.correo =?
      GROUP BY m.modulo_id
    `, [correo]);

        console.log('📦 [PROGRESO] Progresos en BD:', progresos);
        res.json(progresos);
    } catch (error) {
        console.error('💥 Error al obtener progreso:', error);
        res.status(500).json({ error: 'Error al obtener progreso' });
    }
});

// ✅ OBTENER PROGRESO - GET más REST
router.get('/:correo', verificarToken, async (req, res) => {
    const { correo } = req.params;
    console.log('📥 [PROGRESO GET] Pidiendo progreso para:', correo);

    try {
        const [progresos] = await db.query(`
      SELECT
        m.modulo_id,
        COUNT(cc.contenido_id) as progreso_actual,
        m.total_contenidos
      FROM MODULO m
      LEFT JOIN contenidos_completados cc
        ON cc.modulo_id = m.modulo_id AND cc.correo =?
      GROUP BY m.modulo_id
    `, [correo]);

        res.json(progresos);
    } catch (error) {
        console.error('💥 Error al obtener progreso:', error);
        res.status(500).json({ error: 'Error al obtener progreso' });
    }
});

// ✅ NUEVO: Obtener todos los contenidos completados del usuario
router.get('/contenidos-completados/:correo', verificarToken, async (req, res) => {
    const { correo } = req.params;
    const userCorreo = req.user.correo; // Del JWT

    // Seguridad: solo puedes ver tu propio progreso
    if (correo !== userCorreo) {
        return res.status(403).json({ error: 'No puedes ver progreso ajeno' });
    }

    console.log('📥 [CONTENIDOS-COMPLETADOS] Pidiendo lista para:', correo);

    try {
        const [completados] = await db.query(
            `SELECT modulo_id, contenido_id as num_contenido
       FROM contenidos_completados
       WHERE correo =?
       ORDER BY modulo_id, contenido_id`,
            [correo]
        );

        console.log('📦 [CONTENIDOS-COMPLETADOS] Enviando:', completados);
        res.json(completados);
    } catch (error) {
        console.error('💥 Error al obtener contenidos completados:', error);
        res.status(500).json({ error: 'Error al obtener contenidos completados' });
    }
});

// ✅ COMPLETAR CONTENIDO - CON VALIDACIÓN SECUENCIAL
router.post('/completar', verificarToken, async (req, res) => {
    const { correo, modulo_id, contenido_id } = req.body;
    const userCorreo = req.user.correo; // Del JWT

    // Seguridad: solo puedes completar tu propio progreso
    if (correo !== userCorreo) {
        return res.status(403).json({ error: 'No puedes modificar progreso ajeno' });
    }

    console.log('📝 [COMPLETAR] Usuario:', correo, 'Intenta completar contenido:', contenido_id);

    try {
        // 1. Si NO es el contenido 1, valida que haya completado el anterior
        if (parseInt(contenido_id) > 1) {
            const [anterior] = await db.query(
                `SELECT * FROM contenidos_completados
         WHERE correo =? AND modulo_id =? AND contenido_id =?`,
                [correo, modulo_id, parseInt(contenido_id) - 1]
            );

            if (!anterior.length) {
                console.log(`🔒 [COMPLETAR] BLOQUEADO: No completó contenido ${contenido_id - 1}`);
                return res.status(403).json({
                    error: 'Bloqueado',
                    mensaje: `Debes completar el contenido ${contenido_id - 1} primero`
                });
            }
        }

        // 2. Marca este contenido como completado
        await db.query(
            `INSERT IGNORE INTO contenidos_completados (correo, modulo_id, contenido_id, fecha_completado)
       VALUES (?,?,?, NOW())`,
            [correo, modulo_id, contenido_id]
        );

        // 3. Cuenta cuántos lleva completados en este módulo
        const [completados] = await db.query(
            'SELECT COUNT(*) as total FROM contenidos_completados WHERE correo =? AND modulo_id =?',
            [correo, modulo_id]
        );

        const nuevoProgreso = completados[0].total;

        // 4. Actualiza progreso_modulos solo para la gráfica
        await db.query(
            `INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE progreso_actual =?`,
            [correo, modulo_id, nuevoProgreso, nuevoProgreso]
        );

        console.log(`✅ [COMPLETAR] Progreso actualizado: ${nuevoProgreso} contenidos completados`);
        res.json({
            success: true,
            nuevoProgreso,
            mensaje: `Contenido ${contenido_id} completado`
        });

    } catch (error) {
        console.error('💥 Error al completar:', error);
        res.status(500).json({ error: 'Error al completar contenido' });
    }
});

// ✅ VALIDAR ACCESO A CONTENIDO - NUEVO ENDPOINT
router.get('/validar/:modulo_id/:numero', verificarToken, async (req, res) => {
    const { modulo_id, numero } = req.params;
    const { correo } = req.user;

    try {
        // Contenido 1 siempre pasa
        if (parseInt(numero) === 1) {
            return res.json({ permitido: true });
        }

        // Valida anterior
        const [anterior] = await db.query(
            `SELECT * FROM contenidos_completados
       WHERE correo =? AND modulo_id =? AND contenido_id =?`,
            [correo, modulo_id, parseInt(numero) - 1]
        );

        if (!anterior.length) {
            return res.status(403).json({
                permitido: false,
                mensaje: `Completa el contenido ${numero - 1} primero`
            });
        }

        res.json({ permitido: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al validar' });
    }
});

module.exports = router;