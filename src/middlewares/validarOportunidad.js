import { check, validationResult } from 'express-validator';

export const validacionesCrearOportunidad = [
    // ─── VALIDACIONES OBLIGATORIAS ───
    check('cliente_id', 'El cliente asociado es obligatorio y debe ser válido')
        .notEmpty()
        .isUUID(),
        
    check('area_id', 'El área es obligatoria y debe ser válida')
        .notEmpty()
        .isUUID(),
        
    check('nombre_oportunidad', 'El nombre de la oportunidad es obligatorio')
        .notEmpty()
        .trim(),
        
    check('monto_estimado', 'El monto estimado debe ser un número mayor o igual a 0')
        .notEmpty()
        .isFloat({ min: 0 }),
        
    check('fecha_cierre_esperada', 'La fecha de cierre esperada debe ser una fecha válida')
        .notEmpty()
        .isISO8601(),

    // ─── VALIDACIONES OPCIONALES / CONDICIONALES ───
    // checkFalsy: true permite que pase la validación si el string viene vacío ("") o null
    check('correo_contacto')
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage('El correo del contacto no tiene un formato válido')
        .trim(),

    check('fase_venta')
        .optional({ checkFalsy: true })
        .isIn(['Prospección', 'Propuesta', 'Negociación', 'Cerrada Ganada'])
        .withMessage('La fase de venta seleccionada es inválida'),

    check('probabilidad_venta')
        .optional({ checkFalsy: true })
        .isIn(['Alta', 'Media', 'Baja'])
        .withMessage('La probabilidad de venta seleccionada es inválida'),

    check('resp_comercial_id')
        .optional({ checkFalsy: true })
        .isUUID()
        .withMessage('El responsable comercial no tiene un identificador válido'),

    check('resp_tecnico_id')
        .optional({ checkFalsy: true })
        .isUUID()
        .withMessage('El responsable técnico no tiene un identificador válido')
];

// ─── MIDDLEWARE PARA ATRAPAR LOS ERRORES ───
// Esta función revisa si alguna de las reglas de arriba falló antes de ir al Controlador
export const revisarErroresOportunidad = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Formateamos el error para que el Front pueda leer el mensaje fácilmente
        return res.status(400).json({ 
            error: errors.array()[0].msg, // Mandamos el primer error encontrado
            detalles: errors.array() 
        });
    }
    next();
};