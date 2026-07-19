import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock } from './helpers/mockDb.js';

const { dbExport, setResponses } = createQueuedDbMock();
mock.module('../src/config/db.js', { defaultExport: dbExport });

const { createCliente, getClientes, updateCliente, deleteCliente, reactivarCliente } =
    await import('../src/controllers/clienteController.js');

describe('clienteController', () => {
    it('createCliente responde 201 y hace COMMIT en el flujo exitoso', async () => {
        const cliente = { id: 'c1', cliente: 'ACME', estado_activo: true };
        setResponses([
            {},                     // BEGIN
            {},                     // set_config
            { rows: [cliente] },    // INSERT
            {},                     // COMMIT
        ]);

        const req = {
            body: { cliente: 'ACME', tipo: 'Privado', tipo_identificacion: 'RUC', identificacion: '123' },
            user: { id: 'user-1' },
        };
        const res = buildRes();

        await createCliente(req, res);

        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, cliente);
    });

    it('createCliente responde 400 cuando la identificación está duplicada (23505)', async () => {
        const dupError = Object.assign(new Error('duplicate'), { code: '23505' });
        setResponses([{}, {}, dupError, {}]);

        const req = {
            body: { cliente: 'ACME', tipo: 'Privado', tipo_identificacion: 'RUC', identificacion: '999' },
            user: { id: 'user-1' },
        };
        const res = buildRes();

        await createCliente(req, res);

        assert.equal(res.statusCode, 400);
        assert.match(res.body.error, /999/);
    });

    it('createCliente responde 500 ante un error inesperado de BD', async () => {
        setResponses([{}, {}, new Error('conexión perdida'), {}]);

        const req = { body: {}, user: { id: 'user-1' } };
        const res = buildRes();

        await createCliente(req, res);

        assert.equal(res.statusCode, 500);
    });

    it('getClientes retorna la lista de clientes', async () => {
        const clientes = [{ id: 'c1' }, { id: 'c2' }];
        setResponses([{ rows: clientes }]);

        const req = { query: {} };
        const res = buildRes();

        await getClientes(req, res);

        assert.deepEqual(res.body, clientes);
    });

    it('getClientes responde 500 si la consulta falla', async () => {
        setResponses([new Error('db down')]);

        const req = { query: {} };
        const res = buildRes();

        await getClientes(req, res);

        assert.equal(res.statusCode, 500);
    });

    it('updateCliente responde 400 si la identificación ya existe en otro cliente', async () => {
        setResponses([
            {},
            {},
            { rows: [{ id: 'otro' }] },
            {},
        ]);

        const req = {
            params: { id: 'c1' },
            body: { cliente: 'ACME', tipo: 'Privado', tipo_identificacion: 'RUC', identificacion: '123' },
            user: { id: 'user-1' },
        };
        const res = buildRes();

        await updateCliente(req, res);

        assert.equal(res.statusCode, 400);
    });

    it('updateCliente responde 404 si el cliente no existe', async () => {
        setResponses([
            {},
            {},
            { rows: [] },
            { rows: [] },
            {},
        ]);

        const req = {
            params: { id: 'no-existe' },
            body: { cliente: 'ACME', tipo: 'Privado', tipo_identificacion: 'RUC', identificacion: '123' },
            user: { id: 'user-1' },
        };
        const res = buildRes();

        await updateCliente(req, res);

        assert.equal(res.statusCode, 404);
    });

    it('updateCliente responde 200 en el flujo exitoso', async () => {
        const actualizado = { id: 'c1', cliente: 'ACME 2' };
        setResponses([{}, {}, { rows: [] }, { rows: [actualizado] }, {}]);

        const req = {
            params: { id: 'c1' },
            body: { cliente: 'ACME 2', tipo: 'Privado', tipo_identificacion: 'RUC', identificacion: '123' },
            user: { id: 'user-1' },
        };
        const res = buildRes();

        await updateCliente(req, res);

        assert.deepEqual(res.body, actualizado);
    });

    it('deleteCliente responde 404 si el cliente no existe', async () => {
        setResponses([{}, {}, { rows: [] }, {}]);

        const req = { params: { id: 'no-existe' }, user: { id: 'user-1' } };
        const res = buildRes();

        await deleteCliente(req, res);

        assert.equal(res.statusCode, 404);
    });

    it('deleteCliente desactiva el cliente exitosamente', async () => {
        const cliente = { id: 'c1', cliente: 'ACME', estado_activo: false };
        setResponses([{}, {}, { rows: [cliente] }, {}]);

        const req = { params: { id: 'c1' }, user: { id: 'user-1' } };
        const res = buildRes();

        await deleteCliente(req, res);

        assert.equal(res.body.cliente.estado_activo, false);
    });

    it('reactivarCliente reactiva el cliente exitosamente', async () => {
        const cliente = { id: 'c1', cliente: 'ACME', estado_activo: true };
        setResponses([{}, {}, { rows: [cliente] }, {}]);

        const req = { params: { id: 'c1' }, user: { id: 'user-1' } };
        const res = buildRes();

        await reactivarCliente(req, res);

        assert.equal(res.body.cliente.estado_activo, true);
    });
});
