import { check } from 'express-validator';

const validarCedula = (cedula) => {
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const digitoRegion = parseInt(cedula[2]);
    if (digitoRegion >= 6) return false;

    let suma = 0;
    for (let i = 0; i < 9; i++) {
        const mult = parseInt(cedula[i]) * (i % 2 === 0 ? 2 : 1);
        suma += mult > 9 ? mult - 9 : mult;
    }
    const digitoVerificador = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    return digitoVerificador === parseInt(cedula[9]);
};

const validarRUC = (ruc) => {
    if (!ruc || ruc.length !== 13 || !/^\d+$/.test(ruc)) return false;
    const establecimiento = ruc.substring(10, 13);
    if (establecimiento === '000') return false;
    return validarCedula(ruc.substring(0, 10));
};

const reglasIdentificacion = check('identificacion').custom((value, { req }) => {
    const tipo = req.body.tipo_identificacion;

    if (tipo === 'Cédula' && !validarCedula(value)) {
        throw new Error('La cédula ingresada no es válida según el algoritmo ecuatoriano.');
    }
    if (tipo === 'RUC' && !validarRUC(value)) {
        throw new Error('El RUC ingresado no es válido (13 dígitos, establecimiento distinto de 000).');
    }
    if (tipo === 'Pasaporte' && (!value || value.length < 5)) {
        throw new Error('El pasaporte debe tener al menos 5 caracteres.');
    }
    return true;
});

export const validacionesCrearCliente = [
    check('cliente', 'El nombre o razón social es obligatorio').notEmpty().trim(),
    check('tipo', 'El tipo de entidad es inválido').isIn(['Público', 'Privado']),
    check('tipo_identificacion', 'El tipo de identificación es inválido').isIn(['Cédula', 'RUC', 'Pasaporte']),
    reglasIdentificacion,
];

export const validacionesActualizarCliente = [
    check('cliente', 'El nombre o razón social es obligatorio').notEmpty().trim(),
    check('tipo', 'El tipo de entidad es inválido').isIn(['Público', 'Privado']),
    check('tipo_identificacion', 'El tipo de identificación es inválido').isIn(['Cédula', 'RUC', 'Pasaporte']),
    reglasIdentificacion,
];