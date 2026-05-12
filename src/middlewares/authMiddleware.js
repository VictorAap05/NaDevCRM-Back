import jwt from 'jsonwebtoken';

<<<<<<< HEAD
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
=======
export const authRequired = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"
>>>>>>> 53c979ebf1099f7d4826af64c8b57cdb6e794b8f

  if (!token) return res.status(401).json({ message: "No autorizado, falta el token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido o expirado" });
<<<<<<< HEAD
    req.user = user; 
    next(); 
  });
};

export default authMiddleware; // <--- ESTO ES VITAL
=======
    req.user = user; // Guardamos los datos del usuario en la petición
    next(); // Continuamos a la siguiente función
  });
};
>>>>>>> 53c979ebf1099f7d4826af64c8b57cdb6e794b8f
