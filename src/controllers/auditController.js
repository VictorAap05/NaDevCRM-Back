import db from '../config/db.js';

export const getAudit = async (req, res) => {
    try {
        // Hacemos el LEFT JOIN con usuarios para traer el nombre y el correo actualizados
        const query = `
            SELECT 
                a.id,
                a.table_name,
                a.action,
                a.old_data,
                a.new_data,
                a.created_at,
                u.nombre AS usuario_nombre,
                u.email AS usuario_email
            FROM public.audit_logs a
            LEFT JOIN public.usuarios u ON a.changed_by = u.id
            ORDER BY a.created_at DESC;
        `;
        
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener la auditoría:", error.message);
        res.status(500).json({ error: 'No se pudo obtener el historial de auditoría' });
    }
};