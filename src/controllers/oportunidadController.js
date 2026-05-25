import db from '../config/db.js';

export const getOportunidades = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM oportunidad
            WHERE estado_activo = true 
            ORDER BY fecha_creacion DESC
        `);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ ERROR EN GET OPORTUNIDADES:", error);
        res.status(500).json({ 
            error: "Error interno del servidor", 
            message: error.message 
        });
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

        if (usuarioActivoId) {
            await client.query(
                `SELECT set_config('request.jwt.claims', json_build_object('sub', $1::text)::text, true)`, 
                [usuarioActivoId]
            );
        }

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
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error("❌ ERROR EN POST OPORTUNIDAD:", error);
        res.status(500).json({ 
            error: "Error interno al guardar la oportunidad", 
            message: error.message 
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};