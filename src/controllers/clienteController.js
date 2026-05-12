import db from '../config/db.js';

export const getClientes = async (req, res) => {
    try {
        // Obtenemos los clientes ordenados por los más recientes
        const result = await db.query(
            'SELECT * FROM clientes ORDER BY fecha_creacion DESC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

export const createCliente = async (req, res) => {
    const { cliente, tipo, tipo_identificacion, identificacion } = req.body;
    
    // El ID del usuario suele venir del token decodificado en el middleware
    const creado_por = req.user?.id || 'sistema'; 

    try {
        const query = `
            INSERT INTO clientes (cliente, tipo, tipo_identificacion, identificacion, creado_por)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [cliente, tipo, tipo_identificacion, identificacion, creado_por];
        
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar el cliente en la base de datos' });
    }
};