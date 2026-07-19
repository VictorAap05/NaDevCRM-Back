import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock } from './helpers/mockDb.js';

const { dbExport, setResponses } = createQueuedDbMock();
mock.module('../src/config/db.js', { namedExports: { pool: dbExport } });

const { crearComentario, obtenerComentariosPorOportunidad } =
    await import('../src/controllers/comentarioController.js');

describe('comentarioController.crearComentario', () => {
    it('responde 400 si el contenido está vacío', async () => {
        const req = { body: { contenido: '   ' }, params: { id: 'op1' }, user: { id: 'u1' } };
        const res = buildRes();

        await crearComentario(req, res);

        assert.equal(res.statusCode, 400);
    });

    it('responde 201 en el flujo exitoso', async () => {
        const comentario = { id: 'c1', contenido: 'Hola' };
        setResponses([{ rows: [comentario] }]);

        const req = { body: { contenido: 'Hola' }, params: { id: 'op1' }, user: { id: 'u1' } };
        const res = buildRes();

        await crearComentario(req, res);

        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body.comentario, comentario);
    });

    it('responde 400 si el id de oportunidad no es UUID válido (22P02)', async () => {
        setResponses([Object.assign(new Error('bad uuid'), { code: '22P02' })]);

        const req = { body: { contenido: 'Hola' }, params: { id: 'no-uuid' }, user: { id: 'u1' } };
        const res = buildRes();

        await crearComentario(req, res);

        assert.equal(res.statusCode, 400);
    });

    it('responde 404 si la oportunidad no existe (23503)', async () => {
        setResponses([Object.assign(new Error('fk'), { code: '23503' })]);

        const req = { body: { contenido: 'Hola' }, params: { id: 'op-inexistente' }, user: { id: 'u1' } };
        const res = buildRes();

        await crearComentario(req, res);

        assert.equal(res.statusCode, 404);
    });
});

describe('comentarioController.obtenerComentariosPorOportunidad', () => {
    it('retorna los comentarios de una oportunidad', async () => {
        const comentarios = [{ comentario_id: 'c1' }];
        setResponses([{ rowCount: 1, rows: comentarios }]);

        const req = { params: { id: 'op1' } };
        const res = buildRes();

        await obtenerComentariosPorOportunidad(req, res);

        assert.deepEqual(res.body.comentarios, comentarios);
    });

    it('responde 400 si el id no es UUID válido', async () => {
        setResponses([Object.assign(new Error('bad uuid'), { code: '22P02' })]);

        const req = { params: { id: 'no-uuid' } };
        const res = buildRes();

        await obtenerComentariosPorOportunidad(req, res);

        assert.equal(res.statusCode, 400);
    });
});
