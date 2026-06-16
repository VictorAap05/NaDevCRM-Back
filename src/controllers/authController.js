import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const registrarUsuario = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO usuarios (nombre, email, password_hash, rol) 
      VALUES ($1, $2, $3, $4) RETURNING id, email, rol
    `;
    const result = await pool.query(query, [nombre, email, passwordHash, rol || 'Vendedor']);
    
    res.status(201).json({ message: "Usuario creado", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "El email ya está registrado o hay un error en la DB" });
  }
};

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
    res.status(500).json({ error: "Error interno del servidor" });
  }
};