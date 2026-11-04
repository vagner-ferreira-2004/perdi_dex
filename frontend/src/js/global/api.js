(function () {
    const apiBase = (window.PERDIDEX_API_BASE_URL || 'http://localhost:3333').replace(/\/+$/, '');
    let csrfToken = null;
    let csrfRequest = null;

    class ApiError extends Error {
        constructor(message, status, details) {
            super(message);
            this.name = 'ApiError';
            this.status = status;
            this.details = details;
        }
    }

    async function readResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    }

    async function refreshCsrfToken() {
        if (!csrfRequest) {
            csrfRequest = (async () => {
                const response = await fetch(`${apiBase}/auth/csrf`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                    cache: 'no-store'
                });
                const payload = await readResponse(response);
                if (!response.ok || !payload.csrf_token) {
                    throw new ApiError('Não foi possível iniciar uma sessão segura.', response.status, payload);
                }
                csrfToken = payload.csrf_token;
            })();
        }
        try {
            await csrfRequest;
        } finally {
            csrfRequest = null;
        }
    }

    async function request(path, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const headers = new Headers(options.headers || {});
        const body = options.body;
        const isFormData = body instanceof FormData;

        if (body !== undefined && body !== null && !isFormData && typeof body !== 'string') {
            headers.set('Content-Type', 'application/json');
        }
        headers.set('Accept', 'application/json');

        if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            if (!csrfToken) {
                await refreshCsrfToken();
            }
            headers.set('X-CSRF-Token', csrfToken);
        }

        const response = await fetch(`${apiBase}${path}`, {
            ...options,
            method,
            headers,
            body: body !== undefined && body !== null && !isFormData && typeof body !== 'string'
                ? JSON.stringify(body)
                : body,
            credentials: 'include'
        });
        const payload = await readResponse(response);

        if (!response.ok) {
            const message = payload && typeof payload === 'object'
                ? (payload.message || payload.error || 'Não foi possível concluir a solicitação.')
                : 'Não foi possível concluir a solicitação.';
            throw new ApiError(message, response.status, payload && payload.details);
        }

        return payload;
    }

    window.PerdidexApi = {
        ApiError,
        get: (path, options) => request(path, { ...options, method: 'GET' }),
        post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
        patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
        delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
        refreshCsrfToken,
        logout: async () => {
            const result = await request('/auth/logout', { method: 'POST' });
            csrfToken = null;
            return result;
        }
    };
})();
