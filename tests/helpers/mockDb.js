import { mock } from 'node:test';

/**
 * Creates a db-mock whose responses can be reconfigured per test via
 * `setResponses`. This is needed because Node's ESM cache means the
 * controller module (and therefore its bound `db` reference) is only
 * evaluated once per process, even if mock.module is called again later.
 */
export function createQueuedDbMock() {
    let queue = [];
    let i = 0;

    const query = mock.fn(() => {
        const next = queue[i++];
        if (next instanceof Error) return Promise.reject(next);
        return Promise.resolve(next ?? { rows: [] });
    });

    const setResponses = (responses) => {
        queue = responses;
        i = 0;
    };

    return { dbExport: { query, connect: mock.fn() }, setResponses, query };
}

export function createQueuedClientMock() {
    let queue = [];
    let i = 0;

    const query = mock.fn(() => {
        const next = queue[i++];
        if (next instanceof Error) return Promise.reject(next);
        return Promise.resolve(next ?? { rows: [] });
    });

    const setResponses = (responses) => {
        queue = responses;
        i = 0;
    };

    return { client: { query, release: mock.fn() }, setResponses, query };
}
