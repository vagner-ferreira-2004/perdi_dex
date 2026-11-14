document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.PerdidexSession?.ready;
    if (!user || user.role !== 'admin') return;

    const body = document.getElementById('listaUsuarios');
    const totalEl = document.getElementById('totalUsuarios');
    const message = document.getElementById('mensagemUsuarios');
    const pageLabel = document.getElementById('paginaUsuarios');
    const previous = document.getElementById('usuariosAnterior');
    const next = document.getElementById('usuariosProxima');
    if (!body || !totalEl || !message || !pageLabel || !previous || !next) return;

    let page = 1;
    const perPage = 25;

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.setAttribute('role', isError ? 'alert' : 'status');
    }

    async function loadUsers() {
        body.replaceChildren();
        previous.disabled = true;
        next.disabled = true;
        try {
            const result = await window.PerdidexApi.get(
                `/admin/users?page=${page}&per_page=${perPage}`
            );
            totalEl.textContent = `${result.total} usuário${result.total === 1 ? '' : 's'} ativo${result.total === 1 ? '' : 's'}`;
            pageLabel.textContent = `Página ${result.page}`;
            previous.disabled = page <= 1;
            next.disabled = page * result.per_page >= result.total;
            if (!result.items.length) {
                const row = body.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 5;
                cell.textContent = 'Nenhum usuário ativo nesta página.';
                return;
            }

            result.items.forEach((entry) => {
                const row = body.insertRow();
                [entry.name, entry.email, entry.profile, entry.role].forEach((value) => {
                    row.insertCell().textContent = value || '—';
                });
                const actionCell = row.insertCell();
                if (entry.id_user === user.id_user) {
                    actionCell.textContent = 'Sua conta';
                    return;
                }
                const deactivate = document.createElement('button');
                deactivate.type = 'button';
                deactivate.className = 'btn btn-perigo-cheio';
                deactivate.textContent = 'Desativar';
                deactivate.addEventListener('click', async () => {
                    if (!window.confirm(`Desativar a conta de ${entry.name}?`)) return;
                    deactivate.disabled = true;
                    try {
                        await window.PerdidexApi.delete(`/admin/users/${entry.id_user}`);
                        showMessage(`A conta de ${entry.name} foi desativada.`);
                        await loadUsers();
                    } catch (error) {
                        showMessage(`Não foi possível desativar a conta: ${error.message}`, true);
                        deactivate.disabled = false;
                    }
                });
                actionCell.append(deactivate);
            });
        } catch (error) {
            totalEl.textContent = 'Indisponível';
            showMessage(`Não foi possível carregar os usuários: ${error.message}`, true);
        }
    }

    previous.addEventListener('click', async () => {
        if (page > 1) {
            page -= 1;
            await loadUsers();
        }
    });
    next.addEventListener('click', async () => {
        page += 1;
        await loadUsers();
    });
    await loadUsers();
});
