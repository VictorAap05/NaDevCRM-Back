import db from '../config/db.js';
import { setJwtClaim } from '../utils/dbContext.js';

export const createCliente = async (req, res) => {
    const { cliente, tipo, tipo_identificacion, identificacion } = req.body;
    const creado_por = req.user?.id || null;

    try {
        await db.query('BEGIN');
        await setJwtClaim(db, creado_por);
        const result = await db.query(
            `INSERT INTO clientes (cliente, tipo, tipo_identificacion, identificacion, creado_por, estado_activo)
             VALUES ($1, $2, $3, $4, $5, true)
             RETURNING id, cliente, tipo, tipo_identificacion, identificacion, estado_activo, fecha_creacion;`,
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
        const { estado } = req.query;

        let whereClause = '';
        if (estado === 'activo') whereClause = 'WHERE estado_activo = true';
        else if (estado === 'inactivo') whereClause = 'WHERE estado_activo = false';

        const result = await db.query(
            `SELECT id, cliente, tipo, tipo_identificacion, identificacion, estado_activo, fecha_creacion
             FROM clientes
             ${whereClause}
             ORDER BY fecha_creacion DESC`
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
        await setJwtClaim(db, modificado_por);

        // CA04.3: Identificación duplicada en OTRO cliente
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
             RETURNING id, cliente, tipo, tipo_identificacion, identificacion, estado_activo, fecha_creacion;`,
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
    const modificado_por = req.user?.id || null;

    try {
        await db.query('BEGIN');
        await setJwtClaim(db, modificado_por);

        const result = await db.query(
            `UPDATE clientes
             SET estado_activo = false
             WHERE id = $1
             RETURNING id, cliente, estado_activo;`,
            [id]
        );

        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        await db.query('COMMIT');
        res.json({
            mensaje: `El cliente "${result.rows[0].cliente}" fue desactivado exitosamente.`,
            cliente: result.rows[0]
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error al desactivar cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al desactivar el cliente.' });
    }
};

export const reactivarCliente = async (req, res) => {
    const { id } = req.params;
    const modificado_por = req.user?.id || null;

    try {
        await db.query('BEGIN');
        await setJwtClaim(db, modificado_por);

        const result = await db.query(
            `UPDATE clientes
             SET estado_activo = true
             WHERE id = $1
             RETURNING id, cliente, estado_activo;`,
            [id]
        );

        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        await db.query('COMMIT');
        res.json({
            mensaje: `El cliente "${result.rows[0].cliente}" fue reactivado exitosamente.`,
            cliente: result.rows[0]
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error al reactivar cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al reactivar el cliente.' });
    }
};