import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildRes } from './helpers/mockRes.js';
import { createQueuedDbMock } from './helpers/mockDb.js';

const { dbExport, setResponses } = createQueuedDbMock();
mock.module('../src/config/db.js', { defaultExport: dbExport });

const { getAdminDashboardStats, getJefeDashboardStats, getResponsableDashboardStats } =
    await import('../src/controllers/dashboardController.js');

describe('dashboardController.getAdminDashboardStats', () => {
    it('retorna las métricas agregadas', async () => {
        setResponses([
            { rows: [{ count: 5 }] },
            { rows: [{ count: 10 }] },
            { rows: [{ count: 20 }] },
            { rows: [{ count: 3 }] },
            { rows: [{ id: 1, action: 'UPDATE' }] },
        ]);

        const res = buildRes();
        await getAdminDashboardStats({}, res);

        assert.equal(res.body.usuariosActivos, 5);
        assert.equal(res.body.numeroAreas, 3);
    });

    it('responde 500 si alguna consulta falla', async () => {
        setResponses([
            Promise.reject(new Error('db down')),
            { rows: [{ count: 1 }] },
            { rows: [{ count: 1 }] },
            { rows: [{ count: 1 }] },
            { rows: [] },
        ]);

        const res = buildRes();
        await getAdminDashboardStats({}, res);

        assert.equal(res.statusCode, 500);
    });
});

describe('dashboardController.getJefeDashboardStats', () => {
    it('responde 400 si el jefe no tiene área asignada', async () => {
        setResponses([{ rows: [{ areas: null }] }]);

        const req = { user: { id: 'jefe1' } };
        const res = buildRes();

        await getJefeDashboardStats(req, res);

        assert.equal(res.statusCode, 400);
    });

    it('retorna las métricas por fase del área', async () => {
        setResponses([
            { rows: [{ areas: 'Comercial' }] },
            { rows: [{ count: 2 }] },
            { rows: [{ count: 1 }] },
            { rows: [{ count: 4 }] },
            { rows: [{ count: 3 }] },
        ]);

        const req = { user: { id: 'jefe1' } };
        const res = buildRes();

        await getJefeDashboardStats(req, res);

        assert.equal(res.body.prospeccion, 2);
        assert.equal(res.body.ganadas, 3);
    });
});

describe('dashboardController.getResponsableDashboardStats', () => {
    it('retorna las métricas del responsable', async () => {
        setResponses([
            { rows: [{ count: 1 }] },
            { rows: [{ count: 2 }] },
            { rows: [{ count: 3 }] },
            { rows: [{ count: 4 }] },
        ]);

        const req = { user: { id: 'resp1' } };
        const res = buildRes();

        await getResponsableDashboardStats(req, res);

        assert.equal(res.body.prospeccion, 1);
        assert.equal(res.body.ganadas, 4);
    });
});
