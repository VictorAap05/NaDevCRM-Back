import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock } from './helpers/mockDb.js';

const { dbExport, setResponses } = createQueuedDbMock();
mock.module('../src/config/db.js', { defaultExport: dbExport });

const { getAreas, createArea } = await import('../src/controllers/areaController.js');

describe('areaController', () => {
    it('getAreas retorna la lista de áreas', async () => {
        const areas = [{ id: 1, area: 'Comercial' }];
        setResponses([{ rows: areas }]);

        const res = buildRes();
        await getAreas({}, res);

        assert.deepEqual(res.body, areas);
    });

    it('getAreas responde 500 si la consulta falla', async () => {
        setResponses([new Error('db down')]);

        const res = buildRes();
        await getAreas({}, res);

        assert.equal(res.statusCode, 500);
    });

    it('createArea responde 201 en el flujo exitoso', async () => {
        const area = { id: 1, area: 'Nueva Area' };
        setResponses([{ rows: [area] }]);

        const req = { body: { area: 'Nueva Area' } };
        const res = buildRes();
        await createArea(req, res);

        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, area);
    });

    it('createArea responde 400 si el área ya existe (23505)', async () => {
        setResponses([Object.assign(new Error('dup'), { code: '23505' })]);

        const req = { body: { area: 'Repetida' } };
        const res = buildRes();
        await createArea(req, res);

        assert.equal(res.statusCode, 400);
    });
});
