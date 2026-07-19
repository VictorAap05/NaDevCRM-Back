
export const ROL_ADMINISTRADOR = 'Administrador';
export const ROL_JEFE_DE_AREA = 'Jefe de Area';

/**
 * Setea el claim JWT en la sesión de Postgres para que las políticas RLS
 * puedan identificar al usuario que ejecuta la consulta.
 */
export const setJwtClaim = (client, userId) => {
    if (!userId) return Promise.resolve();
    return client.query(
        `SELECT set_config('request.jwt.claims', json_build_object('sub', $1::text)::text, true)`,
        [userId]
    );
};

/**
 * Obtiene el área asignada a un usuario dado su id.
 */
export const obtenerAreaDeUsuario = async (client, userId) => {
    const { rows } = await client.query('SELECT areas FROM usuarios WHERE id = $1', [userId]);
    return rows[0]?.areas;
};
