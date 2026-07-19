import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock, createQueuedClientMock } from './helpers/mockDb.js';

const { dbExport, setResponses: setDbResponses } = createQueuedDbMock();
const { client, setResponses: setClientResponses } = createQueuedClientMock();

dbExport.connect = mock.fn(() => Promise.resolve(client));

mock.module('../src/config/db.js', { defaultExport: dbExport });

const { getOportunidades, getOportunidadById, createOportunidad, updateOportunidad } =
    await import('../src/controllers/oportunidadController.js');

describe('getOportunidades', () => {
    it('un Administrador ve todas las oportunidades activas', async () => {
        setDbResponses([{ rows: [{ id: 'op1', creado_por: 'x' }] }]);

        const req = { user: { id: 'admin1', rol: 'Administrador' } };
        const res = buildRes();

        await getOportunidades(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body[0].puede_editar, true);
    });

    it('un Jefe de Area ve solo las oportunidades de su área', async () => {
        setDbResponses([
            { rows: [{ areas: 'Comercial' }] }, // obtenerAreaDeUsuario
            { rows: [{ id: 'op1', creado_por: 'otro' }] }, // query filtrada
        ]);

        const req = { user: { id: 'jefe1', rol: 'Jefe de Area' } };
        const res = buildRes();

        await getOportunidades(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body[0].puede_editar, false);
    });

    it('responde 500 ante un error de BD', async () => {
        setDbResponses([new Error('db down')]);

        const req = { user: { id: 'u1', rol: 'Vendedor' } };
        const res = buildRes();

        await getOportunidades(req, res);

        assert.equal(res.statusCode, 500);
    });
});

describe('getOportunidadById', () => {
    it('responde 404 si la oportunidad no existe', async () => {
        setDbResponses([{ rows: [] }]);

        const req = { params: { id: 'no-existe' }, user: { id: 'u1', rol: 'Vendedor' } };
        const res = buildRes();

        await getOportunidadById(req, res);

        assert.equal(res.statusCode, 404);
    });

    it('responde 403 si un Jefe de Area de otra área intenta verla', async () => {
        setDbResponses([
            { rows: [{ id: 'op1', creado_por: 'otro' }] },
            { rows: [{ areas: 'Comercial' }] },
            { rows: [{ areas: 'Técnica' }] },
        ]);

        const req = { params: { id: 'op1' }, user: { id: 'jefe1', rol: 'Jefe de Area' } };
        const res = buildRes();

        await getOportunidadById(req, res);

        assert.equal(res.statusCode, 403);
    });

    it('responde 200 cuando el usuario es el creador', async () => {
        setDbResponses([{ rows: [{ id: 'op1', creado_por: 'u1' }] }]);

        const req = { params: { id: 'op1' }, user: { id: 'u1', rol: 'Vendedor' } };
        const res = buildRes();

        await getOportunidadById(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.puede_editar, true);
    });
});

describe('createOportunidad', () => {
    it('responde 201 en el flujo exitoso', async () => {
        const nueva = { id: 'op1', nombre_oportunidad: 'Proyecto X' };
        setClientResponses([{}, {}, { rows: [nueva] }, {}]); // BEGIN, set_config, INSERT, COMMIT

        const req = { body: { nombre_oportunidad: 'Proyecto X' }, user: { id: 'u1' } };
        const res = buildRes();

        await createOportunidad(req, res);

        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, nueva);
    });

    it('responde 500 y libera el cliente si la inserción falla', async () => {
        setClientResponses([{}, {}, new Error('constraint violada'), {}]);

        const req = { body: {}, user: { id: 'u1' } };
        const res = buildRes();

        await createOportunidad(req, res);

        assert.equal(res.statusCode, 500);
        assert.equal(client.release.mock.callCount() > 0, true);
    });
});

describe('updateOportunidad', () => {
    it('responde 404 si la oportunidad no existe', async () => {
        setClientResponses([{}, { rows: [] }, {}]);

        const req = { params: { id: 'no-existe' }, body: {}, user: { id: 'u1', rol: 'Vendedor' } };
        const res = buildRes();

        await updateOportunidad(req, res);

        assert.equal(res.statusCode, 404);
    });

    it('responde 403 si el usuario no tiene permiso de edición', async () => {
        setClientResponses([
            {},
            { rows: [{ id: 'op1', creado_por: 'otro', resp_comercial_id: null, resp_tecnico_id: null }] },
            {},
        ]);

        const req = { params: { id: 'op1' }, body: {}, user: { id: 'u1', rol: 'Vendedor' } };
        const res = buildRes();

        await updateOportunidad(req, res);

        assert.equal(res.statusCode, 403);
    });

    it('responde 200 en el flujo exitoso', async () => {
        const actualizada = { id: 'op1', nombre_oportunidad: 'Proyecto Y' };
        setClientResponses([
            {},                                    // BEGIN
            { rows: [{ id: 'op1', creado_por: 'u1', resp_comercial_id: null, resp_tecnico_id: null }] }, // SELECT actual
            {},                                    // set_config
            { rows: [actualizada] },                // UPDATE
            {},                                    // COMMIT
        ]);

        const req = {
            params: { id: 'op1' },
            body: { nombre_oportunidad: 'Proyecto Y' },
            user: { id: 'u1', rol: 'Vendedor' },
        };
        const res = buildRes();

        await updateOportunidad(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.puede_editar, true);
        assert.equal(res.body.nombre_oportunidad, 'Proyecto Y');
    });
});
