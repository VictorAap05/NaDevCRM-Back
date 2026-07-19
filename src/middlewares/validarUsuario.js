import { check, validationResult } from 'express-validator';

export const validarCedulaEcuatoriana = (cedula) => {
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;
    const provincia = Number.parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const digitoRegion = Number.parseInt(cedula[2]);
    if (digitoRegion >= 6) return false;

    let suma = 0;
    for (let i = 0; i < 9; i++) {
        const mult = Number.parseInt(cedula[i]) * (i % 2 === 0 ? 2 : 1);
        suma += mult > 9 ? mult - 9 : mult;
    }
    const digitoVerificador = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    return digitoVerificador === Number.parseInt(cedula[9]);
};

export const validacionesCrearUsuario = [
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('email', 'Debe ser un correo electrónico válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 }),
    check('telefono', 'El teléfono debe tener 10 dígitos y empezar con 09').matches(/^09\d{8}$/),
    check('rol', 'El rol es obligatorio').notEmpty(),
    check('cedula').custom((value) => {
        if (!validarCedulaEcuatoriana(value)) {
            throw new Error('La cédula no es válida para el territorio ecuatoriano');
        }
        return true;
    })
];

export const validacionesActualizarUsuario = [
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('email', 'Debe ser un correo electrónico válido').isEmail(),
    check('telefono', 'El teléfono debe tener 10 dígitos y empezar con 09').matches(/^09\d{8}$/),
    check('rol', 'El rol es obligatorio').notEmpty(),
    check('cedula').custom((value) => {
        if (!validarCedulaEcuatoriana(value)) {
            throw new Error('La cédula no es válida para el territorio ecuatoriano');
        }
        return true;
    })
];

export const revisarErrores = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: errors.array()[0].msg, 
            detalles: errors.array() 
        });
    }
    next();
};