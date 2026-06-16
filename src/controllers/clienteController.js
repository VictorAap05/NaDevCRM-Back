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
        const result = await db.query(
            `INSERT INTO clientes (cliente, tipo, tipo_identificacion, identificacion, creado_por)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, cliente, tipo, tipo_identificacion, identificacion, fecha_creacion;`,
            [cliente, tipo, tipo_identificacion, identificacion, creado_por]
        );
        await db.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error al crear cliente:', error.message);
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
        console.error('Error al obtener clientes:', error.message);
        res.status(500).json({ error: 'No se pudo obtener la lista de clientes' });
    }
};

export const updateCliente = async (req, res) => {
    const { id } = req.params;
    const { cliente, tipo, tipo_identificacion, identificacion } = req.body;
    const modificado_por = req.user?.id || null;

    try {
        await db.query('BEGIN');

        if (modificado_por) {
            await db.query(
                `SELECT set_config('request.jwt.claims', json_build_object('sub', $1::text)::text, true)`,
                [modificado_por]
            );
        }

        const duplicado = await db.query(
            'SELECT id FROM clientes WHERE identificacion = $1 AND id != $2',
            [identificacion, id]
        );
        if (duplicado.rows.length > 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({
                error: `La identificación ${identificacion} ya está registrada para otro cliente en el sistema.`
            });
        }

        const result = await db.query(
            `UPDATE clientes
             SET cliente = $1, tipo = $2, tipo_identificacion = $3, identificacion = $4
             WHERE id = $5
             RETURNING id, cliente, tipo, tipo_identificacion, identificacion, fecha_creacion;`,
            [cliente, tipo, tipo_identificacion, identificacion, id]
        );

        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        await db.query('COMMIT');
        res.json(result.rows[0]);

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error al actualizar cliente:', error.message);
        if (error.code === '23505') {
            return res.status(400).json({
                error: `La identificación ${identificacion} ya está registrada para otro cliente en el sistema.`
            });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar el cliente.' });
    }
};

export const deleteCliente = async (req, res) => {
    const { id } = req.params;
    const eliminado_por = req.user?.id || null;

    try {
        await db.query('BEGIN');

        if (eliminado_por) {
            await db.query(
                `SELECT set_config('request.jwt.claims', json_build_object('sub', $1::text)::text, true)`,
                [eliminado_por]
            );
        }

        const opsResult = await db.query(
            'SELECT COUNT(*) AS total FROM oportunidad WHERE cliente_id = $1',
            [id]
        );
        const total = parseInt(opsResult.rows[0].total, 10);

        if (total > 0) {
            await db.query('ROLLBACK');
            return res.status(409).json({
                error: 'No es posible eliminar este cliente porque tiene registros históricos asociados.',
                sugerencia: `Este cliente tiene ${total} oportunidad(es) vinculada(s). Se recomienda cambiar el estado del cliente a "Inactivo" para preservar la integridad de los datos.`,
                tieneRegistrosAsociados: true,
                totalOportunidades: total
            });
        }

        const result = await db.query(
            'DELETE FROM clientes WHERE id = $1 RETURNING id, cliente',
            [id]
        );

        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        await db.query('COMMIT');
        res.json({
            mensaje: `El cliente "${result.rows[0].cliente}" fue eliminado exitosamente.`,
            eliminado: result.rows[0]
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error al eliminar cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el cliente.' });
    }
};