import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token inválido:', error.message);
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

export const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.rol !== 'admin' && req.user.role !== 'admin') {
        console.log('❌ Acceso denegado. Rol:', req.user.rol || req.user.role);
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }

    next();
};

export const verifyDocente = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.rol !== 'docente' && req.user.role !== 'docente') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de docente' });
    }

    next();
};

export const verifyAlumno = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.rol !== 'alumno' && req.user.role !== 'alumno') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de alumno' });
    }

    next();
};