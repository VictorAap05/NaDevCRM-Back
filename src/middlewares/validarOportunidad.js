import { check, validationResult } from 'express-validator';

const reglasBase = [
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

export const validacionesCrearOportunidad = reglasBase;

// Mismas reglas para edición (los campos obligatorios son los mismos)
export const validacionesActualizarOportunidad = reglasBase;

export const revisarErroresOportunidad = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg,
            detalles: errors.array()
        });
    }
    next();
};