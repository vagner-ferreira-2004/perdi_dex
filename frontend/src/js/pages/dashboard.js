function escaparHtml(valor) {
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
    const adminName = document.getElementById('primeiroNomeAdmin');
    const adminAvatar = document.getElementById('avatarTopoAdmin');
    const primeiroNome = (user.name || '').trim().split(/\s+/)[0] || '';
    const nomeEl = document.getElementById('primeiroNomeUser');
    if (nomeEl) nomeEl.textContent = primeiroNome;
    if (adminName) adminName.textContent = primeiroNome;
    const avatar = document.getElementById('avatarTopoUser');
    const iniciais = (user.name || 'U').trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
    if (avatar) avatar.textContent = iniciais;
    if (adminAvatar) adminAvatar.textContent = iniciais;

    const itens = [];
    let page = 1;
    let total = 0;
    try {
        do {
            const endpoint = isAdmin ? '/admin/objects-found' : '/objects-found';
            const response = await window.PerdidexApi.get(`${endpoint}?page=${page}&per_page=100`);
            itens.push(...(response.items || []));
            total = response.total || 0;
            page += 1;
        } while (itens.length < total);
    } catch (error) {
        const container = document.querySelector('.previa.itens');
        if (container) {
            container.textContent = `Não foi possível carregar seus itens: ${error.message}`;
            container.setAttribute('role', 'alert');
        }
        return;
    }

    const solicitacoes = [];
    let solicitacoesErro = null;
    let solicitacoesPagina = 1;
    let solicitacoesTotal = 0;
    try {
        do {
            const endpoint = isAdmin ? '/admin/pickup-requests' : '/pickup-requests';
            const response = await window.PerdidexApi.get(
                `${endpoint}?page=${solicitacoesPagina}&per_page=100`
            );
            solicitacoes.push(...(response.items || []));
            solicitacoesTotal = response.total || 0;
            solicitacoesPagina += 1;
        } while (solicitacoes.length < solicitacoesTotal);
    } catch (error) {
        solicitacoesErro = error;
    }

    const contagens = {
        Pendente: 0,
        Encontrado: 0,
        Reprovado: 0,
        Devolvido: 0
    };
    const porMes = Array(12).fill(0);
    const devolvidosPorMes = Array(12).fill(0);
    const porCategoria = {};
    const ano = new Date().getFullYear();
    itens.forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(contagens, item.status)) contagens[item.status] += 1;
        const categoria = item.category?.name || 'Sem categoria';
        porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
        if (item.found_date) {
            const data = new Date(`${item.found_date}T00:00:00`);
            if (data.getFullYear() === ano) {
                porMes[data.getMonth()] += 1;
                if (item.status === 'Devolvido') devolvidosPorMes[data.getMonth()] += 1;
            }
        }
    });

    const contar = (seletor, valor) => {
        const elemento = document.querySelector(`${seletor} strong`);
        if (elemento) elemento.textContent = String(valor);
    };
    contar('.box.analises', contagens.Pendente);
    contar('.box.aprovados', contagens.Encontrado);
    contar('.box.reprovados', contagens.Reprovado);
    contar('.box.devolvidos', contagens.Devolvido);
    if (isAdmin) {
        const adminListLinks = {
            '.box.analises a': '/pages/admin/analises.html',
            '.box.aprovados a': '/pages/admin/itens-perdidos.html?status=aprovado',
            '.box.reprovados a': '/pages/admin/itens-perdidos.html?status=reprovado',
            '.box.devolvidos a': '/pages/admin/itens-perdidos.html?status=devolvido'
        };
        Object.entries(adminListLinks).forEach(([selector, href]) => {
            const link = document.querySelector(selector);
            if (link) link.href = href;
        });
    }
    const solicitacoesAtivas = solicitacoes.filter(
        (request) => ['Pendente', 'Aprovado'].includes(request.status)
    ).length;
    const resgatesConcluidos = solicitacoes.filter(
        (request) => request.status === 'Concluido'
    ).length;
    contar('.box.solicitados', solicitacoesErro ? '—' : solicitacoesAtivas);
    contar('.box.resgatados', solicitacoesErro ? '—' : resgatesConcluidos);
    const linkSolicitacoes = document.querySelector('.box.solicitados a');
    const linkResgatados = document.querySelector('.box.resgatados a');
    if (linkSolicitacoes) {
        linkSolicitacoes.href = isAdmin
            ? '/pages/admin/solicitacoes.html'
            : '/pages/user/cadastro-item.html?status=solicitado#meus-itens';
        linkSolicitacoes.hidden = false;
        if (solicitacoesErro) linkSolicitacoes.title = `Não foi possível carregar: ${solicitacoesErro.message}`;
    }
    if (linkResgatados) {
        linkResgatados.href = isAdmin
            ? '/pages/admin/itens-perdidos.html'
            : '/pages/user/cadastro-item.html?status=resgatado#meus-itens';
        linkResgatados.hidden = false;
        if (solicitacoesErro) linkResgatados.title = `Não foi possível carregar: ${solicitacoesErro.message}`;
    }

    const progressoDevolvidos = document.querySelector('.qtd-devolvidos');
    const progressoEncontrados = document.querySelector('.qtd-aprovados');
    if (progressoDevolvidos) progressoDevolvidos.textContent = String(contagens.Devolvido);
    if (progressoEncontrados) progressoEncontrados.textContent = String(itens.length);
    const graficoMesTitulo = document.querySelector('.grafico.mes h4');
    if (graficoMesTitulo) graficoMesTitulo.textContent = `${isAdmin ? 'Todos os itens' : 'Seus itens cadastrados'} em ${ano}`;

    window.dispatchEvent(new CustomEvent('perdidexDashboardData', {
        detail: {
            published: contagens.Encontrado,
            pending: contagens.Pendente,
            rejected: contagens.Reprovado,
            returned: contagens.Devolvido,
            byMonth: porMes,
            returnedByMonth: devolvidosPorMes,
            byCategory: porCategoria
        }
    }));

    const statusUi = {
        Pendente: ['analise', 'Em análise'],
        Encontrado: ['aprovado', 'Publicado'],
        Reprovado: ['reprovado', 'Reprovado'],
        Devolvido: ['devolvido', 'Devolvido']
    };
    const recentes = itens
        .sort((a, b) => String(b.found_date).localeCompare(String(a.found_date)))
        .slice(0, 2);
    const containerItens = document.querySelector('.previa.itens');
    if (containerItens) {
        const cards = recentes.map((item) => {
            const status = statusUi[item.status] || statusUi.Pendente;
            const data = item.found_date ? new Date(`${item.found_date}T00:00:00`).toLocaleDateString('pt-BR') : '';
            const local = [item.location?.central_place, item.location?.description].filter(Boolean).join(' - ');
            return `<div class="item"><img src="${escaparHtml(item.photo?.url || '')}" alt="Foto do item"><div class="info"><div class="texto"><p class="texto-limitado-2">${escaparHtml(item.characteristic?.description || '')}</p><div class="atributos"><span class="data"><i class="fa-solid fa-calendar"></i><p>${escaparHtml(data)}</p></span><span class="local"><i class="fa-solid fa-location-dot"></i><p>${escaparHtml(local)}</p></span></div></div><div class="status ${status[0]}"><span>${status[1]}</span></div></div></div>`;
        }).join('<hr>');
        const listUrl = isAdmin
            ? '/pages/admin/itens-perdidos.html'
            : '/pages/user/cadastro-item.html#meus-itens';
        const registerUrl = isAdmin
            ? '/pages/admin/analises.html'
            : '/pages/user/cadastro-item.html';
        containerItens.innerHTML = `<div class="funcao"><h4 class="subtitulo">${isAdmin ? 'Itens recentes' : 'Últimos itens cadastrados'}</h4><a class="ver-pagina" href="${listUrl}">Ver todos <i class="fa-solid fa-arrow-right"></i></a></div>${cards || '<p>Nenhum item encontrado.</p>'}<a class="ver-cadastro" href="${registerUrl}"><i class="fa-solid fa-plus"></i><span>${isAdmin ? 'Revisar cadastros' : 'Cadastrar novo item'}</span></a>`;
    }

    const containerNotif = document.querySelector('.previa.notificacoes');
    if (containerNotif) {
        try {
            const response = await window.PerdidexApi.get('/notifications?page=1&per_page=3');
            const recentNotifications = response.items || [];
            const cards = recentNotifications.map((notification, index) => {
                const link = typeof notification.link === 'string' && notification.link.startsWith('/pages/')
                    ? notification.link
                    : isAdmin
                        ? '/pages/admin/notificacoes.html'
                        : '/pages/user/notificacoes.html';
                const date = new Date(notification.created_at).toLocaleDateString('pt-BR');
                return `<div class="notificacao ${notification.read_at ? 'lida' : 'nao-lida'}">
                    <div class="foto notif-foto-wrapper"><div class="notif-icon-status"><i class="fa-regular fa-bell"></i></div></div>
                    <div class="info"><div class="texto"><h5>${escaparHtml(notification.title)}</h5><span class="texto-limitado-1">${escaparHtml(notification.body)}</span></div>
                    <div class="time">${escaparHtml(date)} <div class="leitura ${notification.read_at ? 'lido' : 'nao-lido'}"></div></div>
                    <a class="dashboard-notificacao-link" href="${escaparHtml(link)}">Abrir</a></div>
                </div>${index < recentNotifications.length - 1 ? '<hr>' : ''}`;
            }).join('');
            const notificationsUrl = isAdmin
                ? '/pages/admin/notificacoes.html'
                : '/pages/user/notificacoes.html';
            containerNotif.innerHTML = `<div class="funcao"><h4 class="subtitulo">Notificações</h4><a class="ver-pagina" href="${notificationsUrl}">Ver todas <i class="fa-solid fa-arrow-right"></i></a></div>${cards || '<p>Nenhuma notificação.</p>'}`;
        } catch (error) {
            const notificationsUrl = isAdmin
                ? '/pages/admin/notificacoes.html'
                : '/pages/user/notificacoes.html';
            containerNotif.innerHTML = `<div class="funcao"><h4 class="subtitulo">Notificações</h4><a class="ver-pagina" href="${notificationsUrl}">Ver todas</a></div><p role="alert">Não foi possível carregar as notificações: ${escaparHtml(error.message)}</p>`;
        }
    }
});
