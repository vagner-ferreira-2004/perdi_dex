document.addEventListener('DOMContentLoaded', async () => {
    const sessionUser = window.PerdidexSession
        ? await window.PerdidexSession.ready
        : null;
    const isAdmin = sessionUser?.role === 'admin';
    const dadosOriginais = [];

    let categorias = [];
    let locais = [];
    let listaExibida = [];
    let statusFiltroSelecionado = 'todos';

    if (document.querySelector('meus-itens')) await customElements.whenDefined('meus-itens');
    if (document.querySelector('todos-itens')) await customElements.whenDefined('todos-itens');

    function normalizar(texto) {
        return (texto || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    function mapearItem(item, meuCadastro = false) {
        const statusUi = {
            Pendente: 'analise',
            Encontrado: 'aprovado',
            Reprovado: 'reprovado',
            Devolvido: 'devolvido'
        };
        const location = item.location || {};
        const characteristic = item.characteristic || {};
        const photo = item.photo || {};
        const [year, month, day] = (item.found_date || '').split('-');

        return {
            id: item.id_object,
            idCategoria: item.id_category,
            idLocal: item.id_location,
            foto: photo.url || photo.source || '',
            categoria: item.category?.name || 'Sem categoria',
            descricao: characteristic.description || '',
            local: [location.central_place, location.description].filter(Boolean).join(' - '),
            data: year && month && day ? `${day}/${month}/${year}` : '',
            corNome: characteristic.color || '',
            corClasse: normalizar(characteristic.color),
            marca: characteristic.brand || '',
            status: statusUi[item.status] || 'analise',
            apiStatus: item.status,
            motivoReprovacao: item.review_reason || '',
            meuCadastro,
            usuarioSolicitou: false,
            estadoSolicitacao: null
        };
    }

    async function carregarItens() {
        const isMeusItens = Boolean(document.querySelector('meus-itens'));
        const endpoint = isMeusItens
            ? '/objects-found'
            : isAdmin ? '/admin/objects-found' : '/public/objects-found';
        let page = 1;
        let total = 0;
        do {
            const response = await window.PerdidexApi.get(
                `${endpoint}?page=${page}&per_page=100`
            );
            dadosOriginais.push(...(response.items || []).map((item) => mapearItem(item, isMeusItens)));
            total = response.total || 0;
            page += 1;
        } while (dadosOriginais.length < total);

        if (isMeusItens) {
            let requestPage = 1;
            let requestTotal = 0;
            do {
                const requests = await window.PerdidexApi.get(
                    `/pickup-requests?page=${requestPage}&per_page=100`
                );
                (requests.items || []).forEach((pickupRequest) => {
                    if (!['Pendente', 'Aprovado', 'Concluido'].includes(pickupRequest.status)) return;
                    const item = mapearItem(pickupRequest.item);
                    item.usuarioSolicitou = true;
                    item.pickupRequestId = pickupRequest.id_pickup_request;
                    item.estadoSolicitacao = pickupRequest.status.toLowerCase();
                    item.status = pickupRequest.status === 'Concluido' ? 'resgatado' : 'solicitado';
                    item.apiStatus = pickupRequest.status;
                    dadosOriginais.push(item);
                });
                requestTotal = requests.total || 0;
                requestPage += 1;
            } while ((requestPage - 1) * 100 < requestTotal);
        } else if (!isAdmin && sessionUser) {
            let requestPage = 1;
            let requestTotal = 0;
            do {
                const requests = await window.PerdidexApi.get(
                    `/pickup-requests?page=${requestPage}&per_page=100`
                );
                (requests.items || []).forEach((pickupRequest) => {
                    if (!['Pendente', 'Aprovado'].includes(pickupRequest.status)) return;
                    const item = dadosOriginais.find((entry) => entry.id === pickupRequest.id_object);
                    if (!item) return;
                    item.usuarioSolicitou = true;
                    item.pickupRequestId = pickupRequest.id_pickup_request;
                    item.estadoSolicitacao = pickupRequest.status.toLowerCase();
                    item.status = 'solicitado';
                    item.apiStatus = pickupRequest.status;
                });
                requestTotal = requests.total || 0;
                requestPage += 1;
            } while ((requestPage - 1) * 100 < requestTotal);
            let disputePage = 1;
            let disputeTotal = 0;
            do {
                const returnedItems = await window.PerdidexApi.get(
                    `/disputes/eligible-items?page=${disputePage}&per_page=100`
                );
                dadosOriginais.push(...(returnedItems.items || []).map((item) => mapearItem(item)));
                disputeTotal = returnedItems.total || 0;
                disputePage += 1;
            } while ((disputePage - 1) * 100 < disputeTotal);
        }
    }

    async function atualizarItem(item, dadosNovos) {
        const categoria = categorias.find((entry) => normalizar(entry.name) === normalizar(dadosNovos.categoria));
        const local = locais.find((entry) => normalizar(
            [entry.central_place, entry.description].filter(Boolean).join(' - ')
        ) === normalizar(dadosNovos.local));
        const [day, month, year] = (dadosNovos.data || '').split('/');
        if (!categoria || !local || !day || !month || !year) {
            throw new Error('Selecione uma categoria, local e data válidos.');
        }

        const body = new FormData();
        body.append('id_category', String(categoria.id_category));
        body.append('id_location', String(local.id_location));
        body.append('found_date', `${year}-${month}-${day}`);
        body.append('color', dadosNovos.corNome || item.corNome);
        body.append('brand', dadosNovos.marca || 'Desconhecida');
        body.append('description', dadosNovos.descricao);
        if (dadosNovos.foto?.startsWith('data:image/')) {
            const [header, encoded] = dadosNovos.foto.split(',');
            const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
            const bytes = atob(encoded);
            const buffer = new Uint8Array(bytes.length);
            for (let index = 0; index < bytes.length; index += 1) {
                buffer[index] = bytes.charCodeAt(index);
            }
            body.append('photo', new File([buffer], 'item.jpg', { type: mime }));
        }

        const updated = await window.PerdidexApi.patch(`/objects-found/${item.id}`, body);
        Object.assign(item, mapearItem(updated, true));
        executarBuscaEFiltros();
    }

    async function excluirItem(item) {
        await window.PerdidexApi.delete(`/objects-found/${item.id}`);
        const index = dadosOriginais.findIndex((entry) => entry.id === item.id);
        if (index >= 0) dadosOriginais.splice(index, 1);
        executarBuscaEFiltros();
    }

    async function cancelarSolicitacao(item) {
        await window.PerdidexApi.delete(`/pickup-requests/${item.pickupRequestId}`);
        const index = dadosOriginais.findIndex((entry) => entry.pickupRequestId === item.pickupRequestId);
        if (index >= 0) dadosOriginais.splice(index, 1);
        executarBuscaEFiltros();
    }

    async function solicitarResgate(item) {
        const pickupRequest = await window.PerdidexApi.post(
            `/objects-found/${item.id}/pickup-requests`,
            {}
        );
        item.usuarioSolicitou = true;
        item.pickupRequestId = pickupRequest.id_pickup_request;
        item.estadoSolicitacao = pickupRequest.status.toLowerCase();
        item.status = 'solicitado';
        item.apiStatus = pickupRequest.status;
        if (document.querySelector('meus-itens')) {
            const requestedItem = mapearItem(pickupRequest.item);
            requestedItem.usuarioSolicitou = true;
            requestedItem.pickupRequestId = pickupRequest.id_pickup_request;
            requestedItem.estadoSolicitacao = pickupRequest.status.toLowerCase();
            requestedItem.status = 'solicitado';
            requestedItem.apiStatus = pickupRequest.status;
            dadosOriginais.push(requestedItem);
        }
        executarBuscaEFiltros();
    }

    async function contestarPropriedade(item, data) {
        const description = data.description.trim();
        if (description.length < 20 || description.length > 2000) {
            throw new Error('A descrição deve ter entre 20 e 2000 caracteres.');
        }
        if (data.files.length > 3) {
            throw new Error('Envie no máximo 3 imagens como evidência.');
        }
        if (data.files.some((file) => file.size > 10 * 1024 * 1024)) {
            throw new Error('Cada evidência deve ter no máximo 10 MB.');
        }
        const body = new FormData();
        body.append('description', description);
        data.files.forEach((file) => body.append('evidence', file));
        await window.PerdidexApi.post(`/objects-found/${item.id}/disputes`, body);
        const index = dadosOriginais.findIndex((entry) => entry.id === item.id && !entry.meuCadastro);
        if (index >= 0) dadosOriginais.splice(index, 1);
        executarBuscaEFiltros();
    }

    async function confirmarRetirada(item, password) {
        const confirmed = await window.PerdidexApi.post(
            `/pickup-requests/${item.pickupRequestId}/confirm`,
            { current_password: password }
        );
        item.status = 'resgatado';
        item.apiStatus = confirmed.status;
        item.estadoSolicitacao = confirmed.status;
        executarBuscaEFiltros();
    }

    try {
        if (!window.PerdidexApi) {
            throw new Error('O cliente da API não foi carregado.');
        }
        const [categoriasResponse, locaisResponse] = await Promise.all([
            window.PerdidexApi.get('/categories'),
            window.PerdidexApi.get('/locations')
        ]);
        categorias = categoriasResponse.items || [];
        locais = locaisResponse.items || [];
        await carregarItens();
    } catch (error) {
        const container = document.querySelector('meus-itens, todos-itens');
        if (container) {
            container.innerHTML = `<div class="nenhum-item" role="alert"><h5>Não foi possível carregar os itens</h5><p>${error.message}</p></div>`;
        }
        return;
    }

    /* 2. INICIALIZAÇÃO DOS MODAIS */
    GerenciadorModais?.init({
        onConfirmarEditar: async (item, dadosNovos) => {
            await atualizarItem(item, dadosNovos);
        },
        onConfirmarExcluir: async (item) => {
            await excluirItem(item);
        },
        onConfirmarCancelarSolicitacao: async (item) => {
            await cancelarSolicitacao(item);
        },
        onConfirmarResgate: async (item, evidencias) => {
            await solicitarResgate(item, evidencias);
        },
        onConfirmarContestacao: async (item, evidencias) => {
            await contestarPropriedade(item, evidencias);
        },
        onConfirmarRetirada: async (item, senha) => {
            await confirmarRetirada(item, senha);
        }
    });

    GerenciadorBusca?.init({
        onBuscarEFiltros: () => executarBuscaEFiltros(),
        onOrdenar: (ordem) => aplicarOrdenacao(ordem),
        obterRaizAtiva: () => GerenciadorItens.obterRaizAtiva()
    });

    /* 3. EVENTOS DOS BOTÕES DINÂMICOS */
    function vincularBotoesAcao() {
        const obterItem = (btn) => {
            const id = btn.closest('[data-id]')?.getAttribute('data-id');
            return dadosOriginais.find(d => d.id == id);
        };

        document.querySelectorAll('.btn-detalhes').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirDetalhes(item, GerenciadorItens.ehPaginaMeusItens());
            };
        });

        document.querySelectorAll('.btn-resgatar').forEach(btn => {
            btn.onclick = () => {
                if (!sessionUser) {
                    window.location.assign('/pages/auth/index.html?mode=login');
                    return;
                }
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirResgate(item);
            };
        });
        
        document.querySelectorAll('.btn-contestar').forEach(btn => {
            btn.onclick = () => {
                if (!sessionUser) {
                    window.location.assign('/pages/auth/index.html?mode=login');
                    return;
                }
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirContestar(item);
            };
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirEditar(item);
            };
        });

        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirExcluir(item);
            };
        });

        document.querySelectorAll('.btn-cancelar-solicitacao').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirCancelarSolicitacao(item);
            };
        });

        document.querySelectorAll('.btn-comprovante').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirComprovante(item);
            };
        });
    }

    function atualizarTelas() {
        GerenciadorItens.renderizar(listaExibida);
        vincularBotoesAcao();
    }

    /* 4. ORDENAÇÃO E BUSCA */
    function aplicarOrdenacao(tipo) {
        listaExibida.sort((a, b) => {
            const timeA = GerenciadorDatas ? GerenciadorDatas.converterData(a.data) : 0;
            const timeB = GerenciadorDatas ? GerenciadorDatas.converterData(b.data) : 0;
            return tipo === 'recente' ? timeB - timeA : timeA - timeB;
        });
        atualizarTelas();
    }

    function executarBuscaEFiltros() {
        const isMeusItens = GerenciadorItens.ehPaginaMeusItens();

        const baseDaPagina = dadosOriginais.filter(item => {
            if (isAdmin) return true;
            if (isMeusItens) {
                return item.meuCadastro === true || item.usuarioSolicitou === true;
            } else if (isAdmin) {
                const statusCounts = { todos: listaFiltrada.length, analise: 0, aprovado: 0, reprovado: 0, devolvido: 0 };
                listaFiltrada.forEach(item => {
                    if (Object.prototype.hasOwnProperty.call(statusCounts, item.status)) statusCounts[item.status] += 1;
                });
                Object.entries(statusCounts).forEach(([status, value]) => {
                    const element = document.getElementById(`qtd-${status}`);
                    if (element) element.textContent = value;
                });
            } else {
                return ['aprovado', 'devolvido', 'resgatado'].includes(item.status)
                    || (item.status === 'solicitado' && item.usuarioSolicitou);
            }
        });

        const f = GerenciadorBusca ? GerenciadorBusca.obterFiltrosAtuais() : {
            termo: '', categoria: '', cor: '', tipoData: 'qualquer', dataInicio: '', dataFim: '', ordem: 'recente'
        };

        const dataRef = GerenciadorDatas ? GerenciadorDatas.obterDataReferencia(dadosOriginais) : new Date();
        const umDiaMs = 24 * 60 * 60 * 1000;

        const listaFiltrada = baseDaPagina.filter(item => {
            const desc = normalizar(item.descricao);
            const local = normalizar(item.local);
            const marca = normalizar(item.marca || 'Desconhecida');
            const cat = normalizar(item.categoria);
            const st = normalizar(item.status);

            const bateBusca = !f.termo || desc.includes(f.termo) || local.includes(f.termo) || marca.includes(f.termo) || cat.includes(f.termo) || st.includes(f.termo);

            const categoriasConhecidas = ['eletronicos', 'chaves', 'acessorios', 'bolsas', 'roupas', 'utensilios', 'documentos'];
            const bateCategoria = !f.categoria || (f.categoria === 'outros' ? !categoriasConhecidas.includes(cat) : cat === f.categoria);

            const corItem = normalizar(item.corNome);
            const coresConhecidas = ['preto', 'branco', 'cinza', 'marrom', 'rosa', 'roxo', 'vermelho', 'verde', 'azul', 'amarelo', 'laranja'];
            const bateCor = !f.cor || (f.cor === 'outros' ? !coresConhecidas.includes(corItem) : corItem === f.cor);

            let bateData = true;
            const timestampItem = GerenciadorDatas ? GerenciadorDatas.converterData(item.data) : 0;

            if (f.tipoData === 'semana') {
                bateData = timestampItem >= (dataRef.getTime() - 7 * umDiaMs) && timestampItem <= dataRef.getTime();
            } else if (f.tipoData === 'mes') {
                bateData = timestampItem >= (dataRef.getTime() - 30 * umDiaMs) && timestampItem <= dataRef.getTime();
            } else if (f.tipoData === 'trimestre') {
                bateData = timestampItem >= (dataRef.getTime() - 90 * umDiaMs) && timestampItem <= dataRef.getTime();
            } else if (f.tipoData === 'personalizado') {
                const tsInicio = f.dataInicio ? GerenciadorDatas.converterData(f.dataInicio) : null;
                const tsFim = f.dataFim ? GerenciadorDatas.converterData(f.dataFim) + (umDiaMs - 1) : null;
                if (tsInicio && timestampItem < tsInicio) bateData = false;
                if (tsFim && timestampItem > tsFim) bateData = false;
            }

            return bateBusca && bateCategoria && bateCor && bateData;
        });

        // LÓGICA DE ATUALIZAÇÃO DOS CONTADORES (ABAS)
        if (isMeusItens) {
            const contadores = { todos: listaFiltrada.length, analise: 0, aprovado: 0, reprovado: 0, devolvido: 0, resgatado: 0, solicitado: 0 };
            listaFiltrada.forEach(item => { if (contadores[item.status] !== undefined) contadores[item.status]++; });
            Object.keys(contadores).forEach(st => {
                const el = document.getElementById(`qtd-${st}`);
                if (el) el.textContent = contadores[st];
            });
        } else if (isAdmin) {
            return statusFiltroSelecionado === 'todos' || item.status === statusFiltroSelecionado;
        } else {
            const contadoresGeral = { todos: listaFiltrada.length, perdidos: 0, achados: 0 };
            listaFiltrada.forEach(item => {
                if (item.status === 'aprovado') contadoresGeral.perdidos++;
                if (['devolvido', 'resgatado'].includes(item.status)) contadoresGeral.achados++;
            });
            const elTodos = document.getElementById('qtd-todos');
            const elPerdidos = document.getElementById('qtd-perdidos');
            const elAchados = document.getElementById('qtd-achados');
            if (elTodos) elTodos.textContent = contadoresGeral.todos;
            if (elPerdidos) elPerdidos.textContent = contadoresGeral.perdidos;
            if (elAchados) elAchados.textContent = contadoresGeral.achados;
        }

        listaExibida = listaFiltrada.filter(item => {
            if (isMeusItens) {
                return statusFiltroSelecionado === 'todos' || item.status === statusFiltroSelecionado;
            } else {
                if (statusFiltroSelecionado === 'todos') return true;
                if (statusFiltroSelecionado === 'perdidos') return item.status === 'aprovado';
                if (statusFiltroSelecionado === 'achados') return ['devolvido', 'resgatado'].includes(item.status);
                return true;
            }
        });

        aplicarOrdenacao(f.ordem);
    }

    /* 5. ABAS DE STATUS */
    function atualizarDefinicaoStatus(st) {
        const mapa = { 
            todos: 'todos', analise: 'analises', aprovado: 'aprovados', 
            reprovado: 'reprovados', devolvido: 'devolvidos', resgatado: 'resgatados', solicitado: 'solicitados',
            perdidos: 'perdidos', achados: 'achados'
        };
        document.querySelectorAll('.area-definicao .definicao-status').forEach(el => el.classList.remove('ativo'));
        document.querySelector(`.area-definicao .definicao-status.${mapa[st] || 'todos'}`)?.classList.add('ativo');
    }

    function vincularAbasStatus() {
        document.querySelectorAll('.btn-tab-status').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-tab-status').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                statusFiltroSelecionado = btn.getAttribute('data-status');
                atualizarDefinicaoStatus(statusFiltroSelecionado);
                executarBuscaEFiltros();
            });
        });

        document.querySelectorAll('.link-atalho-status').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const st = link.getAttribute('data-status');
                if (st) {
                    statusFiltroSelecionado = st;
                    document.querySelectorAll('.btn-tab-status').forEach(b => b.classList.toggle('ativo', b.getAttribute('data-status') === st));
                    atualizarDefinicaoStatus(st);
                    executarBuscaEFiltros();
                    const elScroll = document.getElementById('meus-itens') || document.querySelector('todos-itens');
                    elScroll?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        const statusUrl = new URLSearchParams(window.location.search).get('status');
        if (statusUrl) statusFiltroSelecionado = statusUrl;

        document.querySelectorAll('.btn-tab-status').forEach(btn => {
            btn.classList.toggle('ativo', btn.getAttribute('data-status') === statusFiltroSelecionado);
        });

        atualizarDefinicaoStatus(statusFiltroSelecionado);
        executarBuscaEFiltros();
    }

    vincularAbasStatus();
});