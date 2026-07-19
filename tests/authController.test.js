import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock } from './helpers/mockDb.js';

const { dbExport, setResponses } = createQueuedDbMock();
mock.module('../src/config/db.js', { namedExports: { pool: dbExport } });

const { loginUsuario } = await import('../src/controllers/authController.js');

const passwordHash = await bcrypt.hash('secreto123', 10);

describe('authController.loginUsuario', () => {
    it('responde 401 si el usuario no existe', async () => {
        setResponses([{ rows: [] }]);

        const req = { body: { email: 'no@existe.com', password: 'x' } };
        const res = buildRes();

        await loginUsuario(req, res);

        assert.equal(res.statusCode, 401);
    });

    it('responde 401 si la contraseña es incorrecta', async () => {
        setResponses([{ rows: [{ id: 'u1', password_hash: passwordHash, estado_activo: true }] }]);

        const req = { body: { email: 'ana@test.com', password: 'incorrecta' } };
        const res = buildRes();

        await loginUsuario(req, res);

        assert.equal(res.statusCode, 401);
    });

    it('responde 403 si la cuenta está deshabilitada', async () => {
        setResponses([{ rows: [{ id: 'u1', password_hash: passwordHash, estado_activo: false }] }]);

        const req = { body: { email: 'ana@test.com', password: 'secreto123' } };
        const res = buildRes();

        await loginUsuario(req, res);

        assert.equal(res.statusCode, 403);
    });

    it('responde con un token en el flujo exitoso', async () => {
        process.env.JWT_SECRET = 'test-secret';
        setResponses([{ rows: [{ id: 'u1', nombre: 'Ana', rol: 'Vendedor', password_hash: passwordHash, estado_activo: true }] }]);

        const req = { body: { email: 'ana@test.com', password: 'secreto123' } };
        const res = buildRes();

        await loginUsuario(req, res);

        assert.equal(res.statusCode, 200);
        assert.ok(res.body.token);
        assert.equal(res.body.usuario.nombre, 'Ana');
    });

    it('responde 500 ante un error inesperado de BD', async () => {
        setResponses([new Error('db down')]);

        const req = { body: { email: 'ana@test.com', password: 'x' } };
        const res = buildRes();

        await loginUsuario(req, res);

        assert.equal(res.statusCode, 500);
    });
});
