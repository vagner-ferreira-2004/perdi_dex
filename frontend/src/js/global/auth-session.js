document.addEventListener('DOMContentLoaded', () => {
    const api = window.PerdidexApi;
    if (!api) return;

    const isAdminPage = /\/pages\/admin(?:\/|$)/.test(window.location.pathname);
    const authUrl = '/pages/auth/index.html?mode=login';

    window.PerdidexSession = {
        ready: api.get('/users/me')
            .then((user) => {
                const isAdmin = user.role === 'admin';
                if (isAdmin !== isAdminPage) {
                    window.location.replace(
                        isAdmin ? '/pages/admin/index.html' : '/pages/user/index.html'
                    );
                    return null;
                }

                window.PerdidexUser = user;
                window.dispatchEvent(new CustomEvent('perdidexSessionReady', { detail: user }));
                return user;
            })
            .catch((error) => {
                if (error.status === 401) {
                    window.location.replace(authUrl);
                    return null;
                }
                const message = document.createElement('p');
                message.setAttribute('role', 'alert');
                message.className = 'session-error';
                message.textContent = `Não foi possível validar sua sessão: ${error.message}`;
                document.querySelector('main')?.prepend(message);
                return null;
            })
    };
});
