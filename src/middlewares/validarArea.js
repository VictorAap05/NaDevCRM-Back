import { check, validationResult } from 'express-validator';

export const validacionesCrearArea = [
    check('area', 'El nombre del área es obligatorio')
        .notEmpty()
        .trim()
        .isLength({ min: 2 })
        .withMessage('El nombre del área debe tener al menos 2 caracteres')
];

export const revisarErroresArea = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: errors.array()[0].msg, 
            detalles: errors.array() 
        });
    }
    next();
};