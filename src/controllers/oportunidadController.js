import db from '../config/db.js';
import { ROL_ADMINISTRADOR, ROL_JEFE_DE_AREA, setJwtClaim, obtenerAreaDeUsuario } from '../utils/dbContext.js';

// ─── Helper: determina si un usuario puede editar una oportunidad dada ───
export const puedeEditar = (oportunidad, userId, userRol) => {
    if (userRol === ROL_ADMINISTRADOR) return true;

    const esCreador = oportunidad.creado_por === userId;
    const esRespComercial = oportunidad.resp_comercial_id === userId;
    const esRespTecnico = oportunidad.resp_tecnico_id === userId;

    return esCreador || esRespComercial || esRespTecnico;
};

export const getOportunidades = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRol = req.user?.rol;

        let queryStr = `
            SELECT * FROM oportunidad
            WHERE estado_activo = true 
            ORDER BY fecha_creacion DESC
        `;
        let queryParams = [];

        if (userRol === ROL_ADMINISTRADOR) {
            // Acceso sin restricciones adicionales

        } else if (userRol === ROL_JEFE_DE_AREA) {
            // Ve todas las oportunidades creadas por usuarios de su misma área
            const areaAsignada = await obtenerAreaDeUsuario(db, userId);

            queryStr = `
                SELECT o.* 
                FROM oportunidad o
                JOIN usuarios u ON o.creado_por = u.id
                WHERE o.estado_activo = true AND u.areas = $1
                ORDER BY o.fecha_creacion DESC
            `;
            queryParams = [areaAsignada];

        } else {
            // Usuario normal: ve solo las que creó, o donde es responsable comercial o técnico
            queryStr = `
                SELECT * FROM oportunidad
                WHERE estado_activo = true
                  AND (creado_por = $1 OR resp_comercial_id = $1 OR resp_tecnico_id = $1)
                ORDER BY fecha_creacion DESC
            `;
            queryParams = [userId];
        }

        const result = await db.query(queryStr, queryParams);

        // Anexamos un flag para que el frontend sepa si puede editar cada una
        const dataConPermisos = result.rows.map(op => ({
            ...op,
            puede_editar: puedeEditar(op, userId, userRol),
        }));

        res.status(200).json(dataConPermisos);
    } catch (error) {
        console.error("❌ ERROR EN GET OPORTUNIDADES:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.message
        });
    }
};

export const getOportunidadById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRol = req.user?.rol;

    try {
        const result = await db.query('SELECT * FROM oportunidad WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Oportunidad no encontrada.' });
        }

        const oportunidad = result.rows[0];

        // Verificar visibilidad según rol
        if (userRol === ROL_JEFE_DE_AREA) {
            const areaAsignada = await obtenerAreaDeUsuario(db, userId);
            const areaCreador = await obtenerAreaDeUsuario(db, oportunidad.creado_por);

            if (areaCreador !== areaAsignada) {
                return res.status(403).json({ error: 'No tienes permiso para ver esta oportunidad.' });
            }
        } else if (userRol !== ROL_ADMINISTRADOR) {
            const esCreador = oportunidad.creado_por === userId;
            const esRespComercial = oportunidad.resp_comercial_id === userId;
            const esRespTecnico = oportunidad.resp_tecnico_id === userId;

            if (!esCreador && !esRespComercial && !esRespTecnico) {
                return res.status(403).json({ error: 'No tienes permiso para ver esta oportunidad.' });
            }
        }

        res.status(200).json({
            ...oportunidad,
            puede_editar: puedeEditar(oportunidad, userId, userRol),
        });
    } catch (error) {
        console.error("❌ ERROR EN GET OPORTUNIDAD BY ID:", error);
        res.status(500).json({ error: "Error interno del servidor", message: error.message });
    }
};

export const createOportunidad = async (req, res) => {
    const {
        cliente_id,
        nombre_contacto,
        correo_contacto,
        numero_contacto,
        area_id,
        nombre_oportunidad,
        codigo_oportunidad,
        fase_venta,
        monto_estimado,
        probabilidad_venta,
        fecha_cierre_esperada,
        resp_comercial_id,
        resp_tecnico_id,
        descripcion,
        creado_por
    } = req.body;

    const usuarioActivoId = req.user?.id || creado_por || null;

    let client;

    try {
        client = await db.connect();
        await client.query('BEGIN');

        await setJwtClaim(client, usuarioActivoId);

        const query = `
            INSERT INTO oportunidad (
                cliente_id, nombre_contacto, correo_contacto, numero_contacto,
                area_id, nombre_oportunidad, codigo_oportunidad, fase_venta,
                monto_estimado, probabilidad_venta, fecha_cierre_esperada,
                resp_comercial_id, resp_tecnico_id, descripcion, creado_por
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING *;
        `;

        const values = [
            cliente_id,
            nombre_contacto || null,
            correo_contacto || null,
            numero_contacto || null,
            area_id,
            nombre_oportunidad,
            codigo_oportunidad || null,
            fase_venta || 'Prospección',
            monto_estimado,
            probabilidad_venta || 'Media',
            fecha_cierre_esperada,
            resp_comercial_id || null,
            resp_tecnico_id || null,
            descripcion || null,
            usuarioActivoId
        ];

        const result = await client.query(query, values);
        await client.query('COMMIT');

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error("❌ ERROR EN POST OPORTUNIDAD:", error);
        res.status(500).json({
            error: "Error interno al guardar la oportunidad",
            message: error.message
        });
    } finally {
        if (client) client.release();
    }
};

// ─── Edición de oportunidad ───
export const updateOportunidad = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRol = req.user?.rol;

    const {
        cliente_id,
        nombre_contacto,
        correo_contacto,
        numero_contacto,
        area_id,
        nombre_oportunidad,
        codigo_oportunidad,
        fase_venta,
        monto_estimado,
        probabilidad_venta,
        fecha_cierre_esperada,
        resp_comercial_id,
        resp_tecnico_id,
        descripcion,
    } = req.body;

    let client;

    try {
        client = await db.connect();
        await client.query('BEGIN');

        // 1. Obtener la oportunidad actual para validar permisos
        const actual = await client.query('SELECT * FROM oportunidad WHERE id = $1', [id]);

        if (actual.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Oportunidad no encontrada.' });
        }

        const oportunidad = actual.rows[0];

        // 2. Validar permiso de edición
        if (!puedeEditar(oportunidad, userId, userRol)) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                error: 'No tienes permiso para editar esta oportunidad. Solo puede editarla el creador, el responsable comercial, el responsable técnico, o un administrador.'
            });
        }

        // 3. Setear usuario para auditoría
        await setJwtClaim(client, userId);

        // 4. Actualizar
        const query = `
            UPDATE oportunidad SET
                cliente_id = $1,
                nombre_contacto = $2,
                correo_contacto = $3,
                numero_contacto = $4,
                area_id = $5,
                nombre_oportunidad = $6,
                codigo_oportunidad = $7,
                fase_venta = $8,
                monto_estimado = $9,
                probabilidad_venta = $10,
                fecha_cierre_esperada = $11,
                resp_comercial_id = $12,
                resp_tecnico_id = $13,
                descripcion = $14
            WHERE id = $15
            RETURNING *;
        `;

        const values = [
            cliente_id,
            nombre_contacto || null,
            correo_contacto || null,
            numero_contacto || null,
            area_id,
            nombre_oportunidad,
            codigo_oportunidad || null,
            fase_venta || 'Prospección',
            monto_estimado,
            probabilidad_venta || 'Media',
            fecha_cierre_esperada,
            resp_comercial_id || null,
            resp_tecnico_id || null,
            descripcion || null,
            id
        ];

        const result = await client.query(query, values);
        await client.query('COMMIT');

        res.status(200).json({
            ...result.rows[0],
            puede_editar: true,
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error("❌ ERROR EN PUT OPORTUNIDAD:", error);
        res.status(500).json({
            error: "Error interno al actualizar la oportunidad",
            message: error.message
        });
    } finally {
        if (client) client.release();
    }
};