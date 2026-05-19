import db from '../config/db.js';

export const createCliente = async (req, res) => {
    const { cliente, tipo, tipo_identificacion, identificacion } = req.body;
    
    const creado_por = req.user?.id || null; 

    try {
        await db.query('BEGIN');

        if (creado_por) {
            await db.query(
                `SELECT set_config('request.jwt.claims', json_build_object('sub', $1::text)::text, true)`, 
                [creado_por]
            );
        }
        
        const query = `
            INSERT INTO clientes (cliente, tipo, tipo_identificacion, identificacion, creado_por)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, cliente, tipo, tipo_identificacion, identificacion, fecha_creacion;
        `;

        const values = [cliente, tipo, tipo_identificacion, identificacion, creado_por];
        
        const result = await db.query(query, values);
        await db.query('COMMIT');
        res.status(201).json(result.rows[0]);

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error al crear cliente:", error);
        
        // Atrapamos el error de duplicados (Unique Violation) en PostgreSQL
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: `La identificación ${identificacion} ya se encuentra registrada en el sistema.` 
            });
        }

        res.status(500).json({ error: 'Error interno del servidor al registrar el cliente' });
    }
};

export const getClientes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, cliente, tipo, tipo_identificacion, identificacion, fecha_creacion FROM clientes ORDER BY fecha_creacion DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ error: 'No se pudo obtener la lista de clientes' });
    }
};