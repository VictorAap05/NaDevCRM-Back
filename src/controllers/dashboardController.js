import db from '../config/db.js';

// --- DASHBOARD ADMINISTRADOR ---
export const getAdminDashboardStats = async (req, res) => {
    try {
        const [usuariosRes, clientesRes, oportunidadesRes, areasRes] = await Promise.all([
            db.query('SELECT COUNT(*)::int as count FROM usuarios WHERE estado_activo = true;'),
            db.query('SELECT COUNT(*)::int as count FROM clientes WHERE estado_activo = true;'),
            db.query('SELECT COUNT(*)::int as count FROM oportunidad;'),
            db.query('SELECT COUNT(*)::int as count FROM areas;')
        ]);

        res.json({
            usuariosActivos: usuariosRes.rows[0].count,
            clientesActivos: clientesRes.rows[0].count,
            totalOportunidades: oportunidadesRes.rows[0].count,
            numeroAreas: areasRes.rows[0].count
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del administrador:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al recopilar las métricas' });
    }
};

// --- DASHBOARD JEFE DE ÁREA---
export const getJefeDashboardStats = async (req, res) => {
    const jefeId = req.user?.id;

    try {
        const jefeInfo = await db.query('SELECT areas FROM usuarios WHERE id = $1', [jefeId]);
        const areaAsignada = jefeInfo.rows[0]?.areas;

        if (!areaAsignada) {
            return res.status(400).json({ error: 'El jefe de área no tiene un área asignada en el sistema.' });
        }

        // Consultas directas por cada fase real del área
        const [prospeccionRes, propuestaRes, negociacionRes, ganadasRes] = await Promise.all([
            db.query("SELECT COUNT(*)::int FROM oportunidad o JOIN usuarios u ON o.creado_por = u.id WHERE u.areas = $1 AND o.fase_venta = 'Prospección'", [areaAsignada]),
            db.query("SELECT COUNT(*)::int FROM oportunidad o JOIN usuarios u ON o.creado_por = u.id WHERE u.areas = $1 AND o.fase_venta = 'Propuesta'", [areaAsignada]),
            db.query("SELECT COUNT(*)::int FROM oportunidad o JOIN usuarios u ON o.creado_por = u.id WHERE u.areas = $1 AND o.fase_venta = 'Negociación'", [areaAsignada]),
            db.query("SELECT COUNT(*)::int FROM oportunidad o JOIN usuarios u ON o.creado_por = u.id WHERE u.areas = $1 AND o.fase_venta = 'Cerrada Ganada'", [areaAsignada])
        ]);

        res.json({
            prospeccion: prospeccionRes.rows[0].count,
            propuesta: propuestaRes.rows[0].count,
            negociacion: negociacionRes.rows[0].count,
            ganadas: ganadasRes.rows[0].count
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del jefe de área:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al procesar el dashboard del área.' });
    }
};

// --- DASHBOARD RESPONSABLE ---
export const getResponsableDashboardStats = async (req, res) => {
    const responsableId = req.user?.id;

    try {
        // Consultas directas por cada fase real del usuario
        const [prospeccionRes, propuestaRes, negociacionRes, ganadasRes] = await Promise.all([
            db.query("SELECT COUNT(*)::int FROM oportunidad WHERE creado_por = $1 AND fase_venta = 'Prospección'", [responsableId]),
            db.query("SELECT COUNT(*)::int FROM oportunidad WHERE creado_por = $1 AND fase_venta = 'Propuesta'", [responsableId]),
            db.query("SELECT COUNT(*)::int FROM oportunidad WHERE creado_por = $1 AND fase_venta = 'Negociación'", [responsableId]),
            db.query("SELECT COUNT(*)::int FROM oportunidad WHERE creado_por = $1 AND fase_venta = 'Cerrada Ganada'", [responsableId])
        ]);

        res.json({
            prospeccion: prospeccionRes.rows[0].count,
            propuesta: propuestaRes.rows[0].count,
            negociacion: negociacionRes.rows[0].count,
            ganadas: ganadasRes.rows[0].count
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del responsable:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al procesar tu dashboard.' });
    }
};