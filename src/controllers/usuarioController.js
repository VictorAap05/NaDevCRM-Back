import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUsuario = async (req, res) => {
    const { nombre, email, password, rol, cedula, telefono, areas } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
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
        res.status(201).json(result.rows[0]);

    } catch (error) {
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