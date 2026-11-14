function escaparNotificacao(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.PerdidexSession?.ready;
    if (!user || !window.PerdidexApi) return;

    const isAdmin = user.role === 'admin';
    const listContainer = document.getElementById('listaNotificacoes');
    const pagination = document.getElementById('paginacao');
    const overlay = document.getElementById('overlayDetalhe');
    let notifications = [];
    let filter = 'todas';
    let order = 'recentes';
    let page = 1;
    const pageSize = 5;

    function showMessage(text, isError = false) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = text;
        toast.classList.toggle('erro', isError);
        toast.classList.add('mostrar');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('mostrar'), 3000);
    }

    function kindOf(item) {
        if (['aprovado', 'reprovado', 'cadastro', 'solicitacao'].includes(item.kind)) return item.kind;
        return 'outro';
    }

    function isRead(item) {
        return Boolean(item.read_at);
    }

    function matchesFilter(item) {
        if (filter === 'nao-lidas') return !isRead(item);
        if (filter === 'todas') return true;
        if (filter === 'aprovados') return item.kind === 'aprovado';
        if (filter === 'reprovados') return item.kind === 'reprovado';
        if (filter === 'cadastros') return item.kind === 'cadastro';
        if (filter === 'solicitacoes') return item.kind === 'solicitacao';
        return !['aprovado', 'reprovado', 'cadastro', 'solicitacao'].includes(item.kind);
    }

    function timeLabel(value) {
        const date = new Date(value);
        const elapsed = Math.max(0, Date.now() - date.getTime());
        const minutes = Math.floor(elapsed / 60000);
        if (minutes < 60) return minutes <= 1 ? 'Agora mesmo' : `Há ${minutes} minutos`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Há ${hours} hora${hours === 1 ? '' : 's'}`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Ontem';
        return days < 7 ? `Há ${days} dias` : date.toLocaleDateString('pt-BR');
    }

    function updateCounts() {
        const counts = {
            todas: notifications.length,
            'nao-lidas': notifications.filter((item) => !isRead(item)).length,
            aprovados: notifications.filter((item) => item.kind === 'aprovado').length,
            reprovados: notifications.filter((item) => item.kind === 'reprovado').length,
            cadastros: notifications.filter((item) => item.kind === 'cadastro').length,
            solicitacoes: notifications.filter((item) => item.kind === 'solicitacao').length,
            outros: notifications.filter((item) => !['aprovado', 'reprovado', 'cadastro', 'solicitacao'].includes(item.kind)).length
        };
        document.querySelectorAll('.filtro-chip').forEach((chip) => {
            const count = chip.querySelector('.contagem');
            if (count && counts[chip.dataset.filtro] !== undefined) {
                count.textContent = String(counts[chip.dataset.filtro]);
            }
        });
    }

    function filteredItems() {
        const result = notifications.filter(matchesFilter);
        result.sort((a, b) => {
            const difference = new Date(a.created_at) - new Date(b.created_at);
            return order === 'recentes' ? -difference : difference;
        });
        return result;
    }

    function renderPagination(pageCount) {
        if (pageCount <= 1) {
            pagination.replaceChildren();
            return;
        }
        pagination.innerHTML = `<button class="pagina-btn" data-pag="anterior" ${page === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button><span>Página ${page} de ${pageCount}</span><button class="pagina-btn" data-pag="proxima" ${page === pageCount ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;
    }

    function renderList() {
        const items = filteredItems();
        const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
        page = Math.min(page, pageCount);
        const visible = items.slice((page - 1) * pageSize, page * pageSize);
        if (!visible.length) {
            listContainer.innerHTML = '<div class="estado-vazio"><i class="fa-regular fa-bell-slash"></i><h3>Nenhuma notificação por aqui</h3><p>Quando houver novidades, elas aparecerão nesta lista.</p></div>';
        } else {
            listContainer.innerHTML = visible.map((item) => {
                const kind = kindOf(item);
                const icon = {
                    aprovado: 'fa-solid fa-check',
                    reprovado: 'fa-solid fa-xmark',
                    cadastro: 'fa-solid fa-hourglass',
                    solicitacao: 'fa-solid fa-hand',
                    outro: 'fa-solid fa-bell'
                }[kind];
                return `<article class="notificacao ${isRead(item) ? 'lida' : 'nao-lida'}" data-tipo="${kind}" data-id="${item.id_notification}">
                    <div class="grupo1">
                        <div class="notif-foto-wrapper"><div class="notif-icon-status"><i class="${icon}"></i></div></div>
                        <div class="notificacao-corpo">
                            <p class="notificacao-titulo">${escaparNotificacao(item.title)}</p>
                            <p class="notificacao-desc texto-limitado-1">${escaparNotificacao(item.body)}</p>
                        </div>
                    </div>
                    <div class="grupo2">
                        <div class="notificacao-acoes"><button class="btn btn-secundario btn-pequeno" data-acao="ver-mais" data-id="${item.id_notification}">Ver mais <i class="fa-solid fa-arrow-right"></i></button></div>
                        <div class="notificacao-meta"><span class="notificacao-tempo">${escaparNotificacao(timeLabel(item.created_at))}</span><span class="notificacao-status"><span class="bolinha"></span>${isRead(item) ? 'Lida' : 'Não lida'}</span></div>
                        <div class="menu-opcoes">
                            <button class="btn-opcoes" data-acao="abrir-menu" data-id="${item.id_notification}" aria-label="Mais opções"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                            <div class="dropdown-opcoes" data-menu-id="${item.id_notification}">
                                <button data-acao="${isRead(item) ? 'alternar-lida' : 'alternar-lida'}" data-id="${item.id_notification}">${isRead(item) ? 'Marcar como não lida' : 'Marcar como lida'}</button>
                                <button class="excluir" data-acao="excluir" data-id="${item.id_notification}">Excluir notificação</button>
                            </div>
                        </div>
                    </div>
                </article>`;
            }).join('');
        }
        renderPagination(pageCount);
        updateCounts();
    }

    async function reload() {
        notifications = [];
        let currentPage = 1;
        let total = 0;
        do {
            const result = await window.PerdidexApi.get(`/notifications?page=${currentPage}&per_page=100`);
            notifications.push(...(result.items || []));
            total = result.total || 0;
            currentPage += 1;
        } while (notifications.length < total);
        renderList();
    }

    function closeMenus() {
        document.querySelectorAll('.dropdown-opcoes.aberto').forEach((menu) => menu.classList.remove('aberto'));
        document.querySelectorAll('.notificacao').forEach((item) => { item.style.zIndex = ''; });
    }

    async function setRead(item, read) {
        const action = read ? 'read' : 'unread';
        await window.PerdidexApi.patch(`/notifications/${item.id_notification}/${action}`, {});
        item.read_at = read ? new Date().toISOString() : null;
        renderList();
        window.atualizarBadgeGlobal?.();
    }

    function openDetails(item) {
        const modal = overlay.querySelector('.modal');
        modal.dataset.tipo = kindOf(item);
        document.getElementById('detalheFoto').style.display = 'none';
        document.getElementById('detalheIcone').innerHTML = '<i class="fa-solid fa-bell"></i>';
        document.getElementById('detalheTitulo').textContent = item.title;
        document.getElementById('detalheTempo').textContent = timeLabel(item.created_at);
        document.getElementById('detalheDescricao').textContent = item.body;
        const reason = document.getElementById('detalheMotivo');
        reason.style.display = 'none';
        const link = document.getElementById('detalheLinkItem');
        link.href = item.link || '#';
        link.hidden = !item.link;
        overlay.classList.add('aberto');
        if (!isRead(item)) {
            setRead(item, true).catch((error) => showMessage(`Não foi possível marcar como lida: ${error.message}`, true));
        }
    }

    try {
        await reload();
    } catch (error) {
        listContainer.textContent = `Não foi possível carregar as notificações: ${error.message}`;
        listContainer.setAttribute('role', 'alert');
        return;
    }

    document.querySelectorAll('.filtro-chip').forEach((chip) => {
        if (isAdmin && ['aprovados', 'reprovados'].includes(chip.dataset.filtro)) chip.hidden = true;
        if (!isAdmin && ['cadastros', 'solicitacoes'].includes(chip.dataset.filtro)) chip.hidden = true;
        chip.addEventListener('click', () => {
            document.querySelector('.filtro-chip.ativo')?.classList.remove('ativo');
            chip.classList.add('ativo');
            filter = chip.dataset.filtro;
            page = 1;
            renderList();
        });
    });

    document.getElementById('btnMarcarTodas')?.addEventListener('click', async () => {
        try {
            await window.PerdidexApi.patch('/notifications/read-all', {});
            notifications.forEach((item) => { item.read_at = item.read_at || new Date().toISOString(); });
            renderList();
            window.atualizarBadgeGlobal?.();
            showMessage('Todas as notificações foram marcadas como lidas.');
        } catch (error) {
            showMessage(`Não foi possível atualizar as notificações: ${error.message}`, true);
        }
    });

    listContainer.addEventListener('click', async (event) => {
        const action = event.target.closest('[data-acao]');
        if (!action) return;
        const item = notifications.find((notification) => notification.id_notification === Number(action.dataset.id));
        if (!item) return;
        if (action.dataset.acao === 'ver-mais') {
            openDetails(item);
        } else if (action.dataset.acao === 'abrir-menu') {
            const menu = document.querySelector(`.dropdown-opcoes[data-menu-id="${item.id_notification}"]`);
            const wasOpen = menu.classList.contains('aberto');
            closeMenus();
            if (!wasOpen) {
                menu.classList.add('aberto');
                action.closest('.notificacao').style.zIndex = '50';
            }
        } else if (action.dataset.acao === 'alternar-lida') {
            try {
                await setRead(item, isRead(item) ? false : true);
                closeMenus();
            } catch (error) {
                showMessage(`Não foi possível atualizar a notificação: ${error.message}`, true);
            }
        } else if (action.dataset.acao === 'excluir') {
            try {
                await window.PerdidexApi.delete(`/notifications/${item.id_notification}`);
                notifications = notifications.filter((notification) => notification !== item);
                renderList();
                window.atualizarBadgeGlobal?.();
                showMessage('Notificação excluída.');
            } catch (error) {
                showMessage(`Não foi possível excluir a notificação: ${error.message}`, true);
            }
        }
    });

    pagination.addEventListener('click', (event) => {
        const button = event.target.closest('.pagina-btn');
        if (!button || button.disabled) return;
        page += button.dataset.pag === 'proxima' ? 1 : -1;
        renderList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('campoOrdenarNotificacoes')?.addEventListener('click', (event) => {
        const option = event.target.closest('.option');
        if (!option) return;
        order = option.dataset.value;
        const label = document.querySelector('#campoOrdenarNotificacoes .btn-texto');
        if (label) label.textContent = option.textContent.trim();
        page = 1;
        renderList();
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) overlay.classList.remove('aberto');
    });
    document.getElementById('fecharDetalhe')?.addEventListener('click', () => overlay.classList.remove('aberto'));
    document.getElementById('modalNotificacaoFechar')?.addEventListener('click', () => overlay.classList.remove('aberto'));
});
