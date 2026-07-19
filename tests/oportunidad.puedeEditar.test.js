import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { puedeEditar } from '../src/controllers/oportunidadController.js';

const oportunidad = {
    creado_por: 'user-1',
    resp_comercial_id: 'user-2',
    resp_tecnico_id: 'user-3',
};

describe('puedeEditar', () => {
    it('un Administrador siempre puede editar', () => {
        assert.equal(puedeEditar(oportunidad, 'cualquier-id', 'Administrador'), true);
    });

    it('el creador de la oportunidad puede editar', () => {
        assert.equal(puedeEditar(oportunidad, 'user-1', 'Vendedor'), true);
    });

    it('el responsable comercial puede editar', () => {
        assert.equal(puedeEditar(oportunidad, 'user-2', 'Vendedor'), true);
    });

    it('el responsable técnico puede editar', () => {
        assert.equal(puedeEditar(oportunidad, 'user-3', 'Vendedor'), true);
    });

    it('un usuario sin relación con la oportunidad no puede editar', () => {
        assert.equal(puedeEditar(oportunidad, 'user-999', 'Vendedor'), false);
    });
});
