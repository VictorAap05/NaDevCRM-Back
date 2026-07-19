import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];

    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // --------------------------------
    if (!usuario.estado_activo) {
      return res.status(403).json({ 
        message: "Tu cuenta ha sido deshabilitada. Contacta al administrador del sistema." 
      });
    }
    // --------------------------------

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
  } catch (error) {
    console.error('Error en loginUsuario:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};