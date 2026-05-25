import db from '../config/db.js';

export const getOportunidades = async (req, res) => {
    try {
        // Obtenemos las oportunidades ordenadas por las más recientes
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

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        if (creado_por) {
            const jwtClaims = JSON.stringify({ sub: creado_por });
            await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [jwtClaims]);
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

        // Los UUIDs vacíos o strings vacíos se convierten a null para no romper PostgreSQL
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
            creado_por || null
        ];

        // 4. Ejecutamos el query usando el cliente de la transacción
        const result = await client.query(query, values);
        
        // 5. Confirmamos que todo salió bien y guardamos los datos
        await client.query('COMMIT');
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        // 6. Si algo falla (el trigger, el insert, etc.), deshacemos todo
        await client.query('ROLLBACK');
        console.error("❌ ERROR EN POST OPORTUNIDAD:", error);
        res.status(500).json({ 
            error: "Error interno al guardar la oportunidad", 
            message: error.message 
        });
    } finally {
        // 7. Liberamos la conexión para que vuelva al pool
        client.release();
    }
};