import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock } from './helpers/mockDb.js';

const { dbExport, setResponses } = createQueuedDbMock();
mock.module('../src/config/db.js', { defaultExport: dbExport });

const { createUsuario, getUsuarios, updateUsuario, deleteUsuario } =
    await import('../src/controllers/usuarioController.js');

describe('usuarioController', () => {
    it('createUsuario responde 201 en el flujo exitoso', async () => {
        const usuario = { id: 'u1', nombre: 'Ana', email: 'ana@test.com' };
        setResponses([{}, {}, { rows: [usuario] }, {}]); // BEGIN, set_config, INSERT, COMMIT

        const req = {
            body: { nombre: 'Ana', email: 'ana@test.com', password: 'pass1234', rol: 'Vendedor', cedula: '123', telefono: '099', areas: null },
            user: { id: 'admin-1' },
        };
        const res = buildRes();

        await createUsuario(req, res);

        assert.equal(res.statusCode, 201);
        assert.deepEqual(res.body, usuario);
    });

    it('createUsuario responde 400 si el email o cédula ya existen (23505)', async () => {
        const dupError = Object.assign(new Error('dup'), { code: '23505' });
        setResponses([{}, {}, dupError, {}]);

        const req = {
            body: { nombre: 'Ana', email: 'ana@test.com', password: 'pass1234', rol: 'Vendedor' },
            user: { id: 'admin-1' },
        };
        const res = buildRes();

        await createUsuario(req, res);

        assert.equal(res.statusCode, 400);
    });

    it('getUsuarios retorna la lista de usuarios', async () => {
        const usuarios = [{ id: 'u1' }, { id: 'u2' }];
        setResponses([{ rows: usuarios }]);

        const req = {};
        const res = buildRes();

        await getUsuarios(req, res);

        assert.deepEqual(res.body, usuarios);
    });

    it('getUsuarios responde 500 si la consulta falla', async () => {
        setResponses([new Error('db down')]);

        const res = buildRes();
        await getUsuarios({}, res);

        assert.equal(res.statusCode, 500);
    });

    it('updateUsuario responde 404 si el usuario no existe', async () => {
        setResponses([{}, {}, { rowCount: 0, rows: [] }, {}]);

        const req = {
            params: { id: 'no-existe' },
            body: { nombre: 'Ana', email: 'a@a.com', rol: 'Vendedor', cedula: '1', telefono: '099', areas: null },
            user: { id: 'admin-1' },
        };
        const res = buildRes();

        await updateUsuario(req, res);

        assert.equal(res.statusCode, 404);
    });

    it('updateUsuario responde 200 en el flujo exitoso', async () => {
        const usuario = { id: 'u1', nombre: 'Ana 2' };
        setResponses([{}, {}, { rowCount: 1, rows: [usuario] }, {}]);

        const req = {
            params: { id: 'u1' },
            body: { nombre: 'Ana 2', email: 'a@a.com', rol: 'Vendedor', cedula: '1', telefono: '099', areas: null },
            user: { id: 'admin-1' },
        };
        const res = buildRes();

        await updateUsuario(req, res);

        assert.equal(res.body.usuario.nombre, 'Ana 2');
    });

    it('deleteUsuario responde 403 si el operador intenta desactivar su propia cuenta', async () => {
        const req = { params: { id: 'admin-1' }, user: { id: 'admin-1' } };
        const res = buildRes();

        await deleteUsuario(req, res);

        assert.equal(res.statusCode, 403);
    });

    it('deleteUsuario responde 404 si el usuario no existe', async () => {
        setResponses([{}, {}, { rowCount: 0, rows: [] }, {}]);

        const req = { params: { id: 'no-existe' }, user: { id: 'admin-1' } };
        const res = buildRes();

        await deleteUsuario(req, res);

        assert.equal(res.statusCode, 404);
    });

    it('deleteUsuario desactiva la cuenta exitosamente', async () => {
        setResponses([{}, {}, { rowCount: 1, rows: [{ id: 'u2' }] }, {}]);

        const req = { params: { id: 'u2' }, user: { id: 'admin-1' } };
        const res = buildRes();

        await deleteUsuario(req, res);

        assert.equal(res.statusCode, 200);
    });
});
