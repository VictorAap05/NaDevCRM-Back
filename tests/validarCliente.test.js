import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validarCedula, validarRUC } from '../src/middlewares/validarCliente.js';

describe('validarCedula', () => {
    it('acepta una cédula ecuatoriana válida', () => {
        assert.equal(validarCedula('1710034065'), true);
    });

    it('rechaza una cédula con longitud distinta a 10', () => {
        assert.equal(validarCedula('12345'), false);
    });

    it('rechaza una cédula con caracteres no numéricos', () => {
        assert.equal(validarCedula('17100a4065'), false);
    });

    it('rechaza una cédula con código de provincia inválido (>24)', () => {
        assert.equal(validarCedula('9910034065'), false);
    });

    it('rechaza una cédula con dígito verificador incorrecto', () => {
        assert.equal(validarCedula('1710034066'), false);
    });

    it('rechaza null/undefined sin lanzar una excepción', () => {
        assert.equal(validarCedula(undefined), false);
        assert.equal(validarCedula(null), false);
    });
});

describe('validarRUC', () => {
    it('acepta un RUC de persona natural válido (tercer dígito < 6)', () => {
        assert.equal(validarRUC('1710034065001'), true);
    });

    it('rechaza un RUC con longitud distinta a 13', () => {
        assert.equal(validarRUC('12345'), false);
    });

    it('rechaza un RUC cuyo establecimiento es "000"', () => {
        assert.equal(validarRUC('1710034065000'), false);
    });

    it('rechaza un RUC con caracteres no numéricos', () => {
        assert.equal(validarRUC('17100340650a1'), false);
    });

    it('rechaza null/undefined sin lanzar una excepción', () => {
        assert.equal(validarRUC(undefined), false);
    });
});
