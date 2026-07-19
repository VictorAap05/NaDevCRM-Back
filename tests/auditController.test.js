import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock } from './helpers/mockDb.js';

const { dbExport, setResponses } = createQueuedDbMock();
mock.module('../src/config/db.js', { defaultExport: dbExport });

const { getAudit } = await import('../src/controllers/auditController.js');

describe('auditController.getAudit', () => {
    it('retorna el historial de auditoría', async () => {
        const logs = [{ id: 1, action: 'UPDATE' }];
        setResponses([{ rows: logs }]);

        const res = buildRes();
        await getAudit({}, res);

        assert.deepEqual(res.body, logs);
    });

    it('responde 500 si la consulta falla', async () => {
        setResponses([new Error('db down')]);

        const res = buildRes();
        await getAudit({}, res);

        assert.equal(res.statusCode, 500);
    });
});
