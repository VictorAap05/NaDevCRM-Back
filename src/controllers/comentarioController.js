import { pool } from '../config/db.js';

export const crearComentario = async (req, res) => {
  const { contenido } = req.body;
  const oportunidad_id = req.params.id;
  const usuario_id = req.user.id;   

  if (!contenido || contenido.trim() === '') {
    return res.status(400).json({ 
      message: "El contenido del comentario no puede estar vacío" 
    });
  }

  try {
    const query = `
      INSERT INTO comentarios (contenido, oportunidad_id, usuario_id)
      VALUES ($1, $2, $3)
      RETURNING id, contenido, fecha_creacion, oportunidad_id, usuario_id;
    `;
    
    const result = await pool.query(query, [contenido, oportunidad_id, usuario_id]);

    return res.status(201).json({
      message: "Comentario registrado con éxito",
      comentario: result.rows[0]
    });

  } catch (error) {
    if (error.code === '22P02') {
      return res.status(400).json({
        error: "El ID de la oportunidad no tiene un formato UUID válido"
      });
    }
    
    if (error.code === '23503') {
      return res.status(404).json({
        error: "La oportunidad especificada no existe en la base de datos"
      });
    }

    return res.status(500).json({
      error: "Error interno al registrar el comentario",
      details: error.message
    });
  }
};

export const obtenerComentariosPorOportunidad = async (req, res) => {
  const oportunidad_id = req.params.id; 

  try {
    const query = `
      SELECT 
        c.id AS comentario_id,
        c.contenido,
        c.fecha_creacion,
        u.id AS usuario_id,
        u.nombre AS usuario_nombre,
        u.rol AS usuario_rol
      FROM comentarios c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.oportunidad_id = $1
      ORDER BY c.fecha_creacion DESC; -- Los más recientes primero
    `;

    const result = await pool.query(query, [oportunidad_id]);

    return res.status(200).json({
      oportunidad_id,
      total_comentarios: result.rowCount,
      comentarios: result.rows
    });

  } catch (error) {
    if (error.code === '22P02') {
      return res.status(400).json({ error: "El ID de la oportunidad no tiene un formato UUID válido" });
    }
    return res.status(500).json({
      error: "Error interno al obtener los comentarios",
      details: error.message
    });
  }
};