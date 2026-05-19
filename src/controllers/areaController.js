import db from '../config/db.js';

export const getAreas = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM areas ORDER BY area ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("ERROR EN GET AREAS:", error);
        res.status(500).json({
            error: "Error interno del servidor al obtener las áreas",
            message: error.message
        });
    }
};

export const createArea = async (req, res) => {
    const { area } = req.body;

    try {
        const query = `
            INSERT INTO areas (area) 
            VALUES ($1) 
            RETURNING *;
        `;
        const values = [area];

        const result = await db.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(" ERROR EN POST AREA:", error);

        if (error.code === '23505') {
            return res.status(400).json({ error: "Ya existe un área registrada con ese nombre." });
        }

        res.status(500).json({
            error: "Error interno al crear el área",
            message: error.message
        });
    }
};