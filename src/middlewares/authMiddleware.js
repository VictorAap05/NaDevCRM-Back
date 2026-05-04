import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: "No autorizado, falta el token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido o expirado" });
    req.user = user; // Guardamos los datos del usuario en la petición
    next(); // Continuamos a la siguiente función
  });
};