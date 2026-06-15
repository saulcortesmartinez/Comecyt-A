// hooks/useGuardarProgreso.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// ✅ HOOK PRINCIPAL - El que usas en ModuloDinamico.jsx
export const useGuardarProgreso = (numContenido, moduloId) => {
    const [cargandoProgreso, setCargandoProgreso] = useState(false);
    const { api, user } = useAuth(); // ✅ Usa api y user del context

    // Marcar contenido como COMPLETADO en BD
    const completarContenido = async () => {
        if (!user?.correo) {
            console.warn("⚠ No hay usuario logueado");
            toast.error("Debes iniciar sesión");
            return false;
        }

        setCargandoProgreso(true);
        console.log('💾 Guardando progreso:', { moduloId, numContenido, correo: user.correo });

        try {
            // ✅ Usa la instancia api que ya trae baseURL + token
            const res = await api.post('/api/alumno/progreso/actualizar', {
                correo: user.correo,
                modulo_id: moduloId,
                contenido_id: numContenido,
            });

            console.log('✅ Contenido completado en BD:', res.data.progreso_actual);
            toast.success('¡Progreso guardado!');
            return true;
        } catch (err) {
            console.error("❌ Error al completar contenido:", err.response?.data || err);
            toast.error(err.response?.data?.error || 'Error al guardar progreso');
            return false;
        } finally {
            setCargandoProgreso(false);
        }
    };

    return {
        cargandoProgreso,
        completarContenido
    };
};


// ✅ HOOK SECUNDARIO - Para Inicio.jsx y temario
export const useCourseProgress = () => {
    const [progress, setProgress] = useState({});
    const [cargandoProgreso, setCargandoProgreso] = useState(false);
    const [modoLibre, setModoLibre] = useState(false);
    const { api, user } = useAuth();

    // ===== Validar acceso a un contenido específico =====
    const puedeAccederContenido = async (moduloId, contenidoId) => {
        try {
            const res = await api.get(`/api/alumno/modulo/${moduloId}/contenido/${contenidoId}`);
            return { puede: true, contenido: res.data };
        } catch (err) {
            if (err.response?.status === 403) {
                return {
                    puede: false,
                    mensaje: err.response.data.mensaje,
                    requerido: err.response.data.contenido_requerido
                };
            }
            throw err;
        }
    };

    // ===== Cargar qué contenidos están completados desde BD =====
    const cargarContenidosCompletados = async (moduloId) => {
        if (!user?.correo) return null;

        setCargandoProgreso(true);
        try {
            const res = await api.post(`/api/alumno/progreso`, { correo: user.correo });
            const modulos = res.data.modulos || [];
            const modulo = modulos.find((m) => m.modulo_id === moduloId);

            // Marcar en estado local solo los que la BD dice que están completos
            const completados = {};
            for (let i = 1; i <= (modulo?.progreso_actual || 0); i++) {
                completados[`m${moduloId}_c${i}`] = true;
            }
            setProgress(prev => ({ ...prev, ...completados }));

            return modulo;
        } catch (err) {
            console.error("Error al cargar progreso:", err);
            return null;
        } finally {
            setCargandoProgreso(false);
        }
    };

    // ===== COMPLETAR CONTENIDO - SOLO CUANDO TERMINA TIMER + CLICK =====
    const completarContenidoBackend = async (moduloId, contenidoId) => {
        if (!user?.correo) return { success: false };

        try {
            const res = await api.post(`/api/alumno/progreso/actualizar`, {
                correo: user.correo,
                modulo_id: moduloId,
                contenido_id: contenidoId,
            });

            // Actualiza estado local solo si el backend confirma
            const key = `m${moduloId}_c${contenidoId}`;
            setProgress(prev => ({ ...prev, [key]: true }));

            console.log('✅ Contenido completado:', res.data.progreso_actual);
            return { success: true, progreso: res.data.progreso_actual };
        } catch (err) {
            console.error("❌ Error al completar:", err);
            return { success: false };
        }
    };

    // ===== FUNCIONES DE LECTURA =====
    const isActivityCompleted = (module, content) => {
        const key = `m${module}_c${content}`;
        return progress[key] === true;
    };

    const getModuleProgress = (module) => {
        const moduleKeys = Object.keys(progress).filter(key =>
            key.startsWith(`m${module}_`) && progress[key] === true
        );
        return moduleKeys.length;
    };

    return {
        // Estado
        progress,
        cargandoProgreso,
        modoLibre,

        // Validación
        puedeAccederContenido,
        cargarContenidosCompletados,

        // Acciones
        completarContenidoBackend,

        // Lectura
        isActivityCompleted,
        getModuleProgress
    };
};