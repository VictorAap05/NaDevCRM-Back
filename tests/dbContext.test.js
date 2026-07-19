import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { setJwtClaim, obtenerAreaDeUsuario, ROL_ADMINISTRADOR, ROL_JEFE_DE_AREA } from '../src/utils/dbContext.js';

describe('setJwtClaim', () => {
    it('no ejecuta query cuando el userId es null', async () => {
        const client = { query: mock.fn() };
        await setJwtClaim(client, null);
        assert.equal(client.query.mock.callCount(), 0);
    });

    it('ejecuta el query de set_config con el userId dado', async () => {
        const client = { query: mock.fn(() => Promise.resolve()) };
        await setJwtClaim(client, 'user-123');

        assert.equal(client.query.mock.callCount(), 1);
        const [sql, params] = client.query.mock.calls[0].arguments;
        assert.match(sql, /set_config/);
        assert.deepEqual(params, ['user-123']);
    });
});

describe('obtenerAreaDeUsuario', () => {
    it('retorna el área del usuario encontrado', async () => {
        const client = {
            query: mock.fn(() => Promise.resolve({ rows: [{ areas: 'Comercial' }] })),
        };
        const area = await obtenerAreaDeUsuario(client, 'user-123');
        assert.equal(area, 'Comercial');
    });

    it('retorna undefined si el usuario no existe', async () => {
        const client = { query: mock.fn(() => Promise.resolve({ rows: [] })) };
        const area = await obtenerAreaDeUsuario(client, 'no-existe');
        assert.equal(area, undefined);
    });
});

describe('constantes de rol', () => {
    it('tienen los valores esperados por el resto del sistema', () => {
        assert.equal(ROL_ADMINISTRADOR, 'Administrador');
        assert.equal(ROL_JEFE_DE_AREA, 'Jefe de Area');
    });
});
