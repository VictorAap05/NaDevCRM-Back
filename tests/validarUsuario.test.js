import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { validarCedulaEcuatoriana, revisarErrores } from '../src/middlewares/validarUsuario.js';

describe('validarCedulaEcuatoriana', () => {
    it('acepta una cédula ecuatoriana válida', () => {
        assert.equal(validarCedulaEcuatoriana('1710034065'), true);
    });

    it('rechaza una cédula con dígito de región inválido (>=6)', () => {
        assert.equal(validarCedulaEcuatoriana('1760034065'), false);
    });

    it('rechaza una cédula vacía', () => {
        assert.equal(validarCedulaEcuatoriana(''), false);
    });
});

describe('revisarErrores middleware', () => {
    it('llama a next() cuando no hay errores de validación', () => {
        // req sin errores de express-validator adjuntos simula el caso feliz
        const req = {};
        const res = {
            status: mock.fn(() => res),
            json: mock.fn(),
        };
        const next = mock.fn();

        revisarErrores(req, res, next);

        assert.equal(next.mock.callCount(), 1);
        assert.equal(res.status.mock.callCount(), 0);
    });
});
