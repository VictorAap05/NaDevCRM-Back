import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import authMiddleware from '../src/middlewares/authMiddleware.js';

const OLD_SECRET = process.env.JWT_SECRET;

beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
});

afterEach(() => {
    process.env.JWT_SECRET = OLD_SECRET;
});

function buildRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; },
    };
    return res;
}

describe('authMiddleware', () => {
    it('responde 401 cuando no se envía header Authorization', () => {
        const req = { headers: {} };
        const res = buildRes();
        const next = mock.fn();

        authMiddleware(req, res, next);

        assert.equal(res.statusCode, 401);
        assert.equal(next.mock.callCount(), 0);
    });

    it('responde 403 cuando el token es inválido', (t, done) => {
        const req = { headers: { authorization: 'Bearer token-invalido' } };
        const res = buildRes();
        const next = mock.fn();

        authMiddleware(req, res, next);

        setImmediate(() => {
            assert.equal(res.statusCode, 403);
            assert.equal(next.mock.callCount(), 0);
            done();
        });
    });

    it('llama a next() y adjunta req.user cuando el token es válido', (t, done) => {
        const token = jwt.sign({ id: 'user-1', rol: 'Administrador' }, process.env.JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = buildRes();
        const next = mock.fn();

        authMiddleware(req, res, next);

        setImmediate(() => {
            assert.equal(next.mock.callCount(), 1);
            assert.equal(req.user.id, 'user-1');
            assert.equal(req.user.rol, 'Administrador');
            done();
        });
    });
});
