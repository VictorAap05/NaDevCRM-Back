import db from '../config/db.js';
import { setJwtClaim } from '../utils/dbContext.js';
import bcrypt from 'bcryptjs';

export const createUsuario = async (req, res) => {
    const { nombre, email, password, rol, cedula, telefono, areas } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query('BEGIN');

        const operador_id = req.user?.id || null;
        await setJwtClaim(db, operador_id);

        
        const query = `
            INSERT INTO usuarios (nombre, email, password_hash, rol, cedula, telefono, areas, estado_activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, nombre, email, rol, cedula, telefono, areas, estado_activo;
        `;

        const values = [
            nombre, 
            email, 
            hashedPassword, 
            rol, 
            cedula, 
            telefono, 
            rol === 'Jefe de Area' ? areas : null, 
            true
        ];
        
        const result = await db.query(query, values);

        await db.query('COMMIT');

        res.status(201).json(result.rows[0]);

    } catch (error) {
        await db.query('ROLLBACK');
        
        console.error("Error en la BD al crear usuario:", error);
        
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: 'El correo electrónico o la cédula ya se encuentran registrados.' 
            });
        }

        res.status(500).json({ error: 'Error interno del servidor al registrar el usuario' });
    }
};

export const getUsuarios = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, nombre, email, rol, cedula, telefono, areas, estado_activo FROM usuarios ORDER BY fecha_creacion DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: 'No se pudo obtener la lista de usuarios' });
    }
};

export const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, cedula, telefono, areas } = req.body;
    
    const operador_id = req.user?.id || null;

    try {
        await db.query('BEGIN');

        await setJwtClaim(db, operador_id);

        const query = `
            UPDATE usuarios 
            SET nombre = $1, email = $2, rol = $3, cedula = $4, telefono = $5, areas = $6, fecha_actualizacion = now()
            WHERE id = $7
            RETURNING id, nombre, email, rol, cedula, telefono, areas, estado_activo;
        `;

        const values = [
            nombre, 
            email, 
            rol, 
            cedula, 
            telefono, 
            rol === 'Jefe de Area' ? areas : null, 
            id
        ];

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await db.query('COMMIT');
        res.json({ message: 'Usuario actualizado con éxito', usuario: result.rows[0] });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error al actualizar usuario:", error);
        
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: 'El correo electrónico o la cédula ya se encuentran registrados para otro usuario.' 
            });
        }

        res.status(500).json({ error: 'Error interno del servidor al actualizar' });
    }
};

export const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    const operador_id = req.user?.id || null;

    if (operador_id === id) {
        return res.status(403).json({ error: 'Acción denegada: No puedes desactivar tu propia cuenta.' });
    }

    try {
        await db.query('BEGIN');

        await setJwtClaim(db, operador_id);

        const query = `
            UPDATE usuarios 
            SET estado_activo = NOT estado_activo, fecha_actualizacion = now()
            WHERE id = $1
            RETURNING id, nombre, estado_activo;
        `;
        
        const result = await db.query(query, [id]);

        if (result.rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await db.query('COMMIT');
        res.json({ message: 'Cuenta de usuario deshabilitada con éxito' });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error al desactivar usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor al desactivar la cuenta' });
    }
};