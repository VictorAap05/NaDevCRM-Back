import { check } from 'express-validator';

export const validarCedula = (cedula) => {
    if (cedula?.length !== 10 || !/^\d+$/.test(cedula)) return false;
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

export const validarRUC = (ruc) => {
    if (!ruc || ruc.length !== 13 || !/^\d+$/.test(ruc)) return false;

    const provincia = Number.parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = Number.parseInt(ruc[2]);
    const establecimiento = ruc.substring(10, 13);
    if (establecimiento === '000') return false;

    if (tercerDigito < 6) {
        return validarCedula(ruc.substring(0, 10));
    }

    if (tercerDigito === 9) {
        const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            suma += Number.parseInt(ruc[i]) * coeficientes[i];
        }
        const residuo = suma % 11;
        const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
        return digitoVerificador === Number.parseInt(ruc[9]);
    }

    if (tercerDigito === 6) {
        const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 8; i++) {
            suma += Number.parseInt(ruc[i]) * coeficientes[i];
        }
        const residuo = suma % 11;
        const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
        return digitoVerificador === Number.parseInt(ruc[8]);
    }

    return false;
};

const reglasIdentificacion = check('identificacion').custom((value, { req }) => {
    const tipo = req.body.tipo_identificacion;
    if (tipo === 'Cédula' && !validarCedula(value)) {
        throw new Error('La cédula ingresada no es válida según el algoritmo ecuatoriano.');
    }
    if (tipo === 'RUC' && !validarRUC(value)) {
        throw new Error('El RUC ingresado no es válido (persona natural, jurídica o pública).');
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