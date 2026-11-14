/* ==========================================================
   COMPONENTES DE BUSCA E ORDENAÇÃO
   ========================================================== */
class SearchComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="search">
            <div class="campo-busca">
                <i class="fi fi-rr-search"></i>
                <input type="text" name="search-input" id="search-input" placeholder="O que você está procurando?">
            </div>

            <div class="btns">
                <button type="button" class="btn-filtros" id="btnToggleFiltros" title="Filtros"><i class="fi fi-rr-settings-sliders"></i></button>
                <button type="button" class="btn-buscar"><i class="fi fi-rr-search"></i> Buscar</button>
            </div>

            <div class="painel-filtros oculto" id="painelFiltros">
                <div class="topo" id="fecharFiltrosHeader">
                    <i class="fi fi-br-sliders-h-square"></i>
                    <span>Filtros</span>
                    <i class="fa-solid fa-angle-up seta-filtro" id="setaFiltro"></i>
                </div>

                <div class="conteudo">
                    <div class="filtros-grid">
                        <div class="filtro-coluna">
                            <div class="custom-select" id="campoFiltroCategoria">
                                <input type="hidden" name="filtro-categoria" id="categoria-selecionada" value="">
                                <label class="filtro-label"><i class="fa-solid fa-box"></i> Categoria</label>
                                <div class="select-btn">
                                    <span class="btn-texto">Todas</span>
                                    <span class="seta"><i class="fa-solid fa-angle-down"></i></span>
                                </div>
                                <div class="select-dropdown">
                                    <div class="option" data-value="">Todas</div>
                                    <div class="option" data-value="Acessórios">Acessórios</div>
                                    <div class="option" data-value="Bolsas">Bolsas</div>
                                    <div class="option" data-value="Chaves">Chaves</div>
                                    <div class="option" data-value="Documentos">Documentos</div>
                                    <div class="option" data-value="Eletrônicos">Eletrônicos</div>
                                    <div class="option" data-value="Roupas">Roupas</div>
                                    <div class="option" data-value="Utensílios">Utensílios</div>
                                    <div class="option" data-value="Outros">Outros</div>
                                </div>
                            </div>
                        </div>

                        <div class="filtro-coluna">
                            <div class="custom-select" id="campoFiltroCor">
                                <input type="hidden" name="filtro-cor" id="cor-selecionada" value="">
                                <label class="filtro-label"><i class="fa-solid fa-palette"></i> Cor</label>
                                <div class="select-btn">
                                    <span class="btn-texto">Todas</span>
                                    <span class="seta"><i class="fa-solid fa-angle-down"></i></span>
                                </div>
                                <div class="select-dropdown">
                                    <div class="option" data-value="">Todas</div>
                                    <div class="option" data-value="Branco"><div class="space-color branco"></div>Branco</div>
                                    <div class="option" data-value="Cinza"><div class="space-color cinza"></div>Cinza</div>
                                    <div class="option" data-value="Rosa"><div class="space-color rosa"></div>Rosa</div>
                                    <div class="option" data-value="Amarelo"><div class="space-color amarelo"></div>Amarelo</div>
                                    <div class="option" data-value="Laranja"><div class="space-color laranja"></div>Laranja</div>
                                    <div class="option" data-value="Vermelho"><div class="space-color vermelho"></div>Vermelho</div>
                                    <div class="option" data-value="Verde"><div class="space-color verde"></div>Verde</div>
                                    <div class="option" data-value="Azul"><div class="space-color azul"></div>Azul</div>
                                    <div class="option" data-value="Roxo"><div class="space-color roxo"></div>Roxo</div>
                                    <div class="option" data-value="Marrom"><div class="space-color marrom"></div>Marrom</div>
                                    <div class="option" data-value="Preto"><div class="space-color preto"></div>Preto</div>
                                    <div class="option" data-value="Outros">Outros</div>
                                </div>
                            </div>
                        </div>

                        <div class="filtro-coluna">
                            <div class="custom-select" id="campoFiltroData">
                                <input type="hidden" name="filtro-data" id="data-selecionada" value="qualquer">
                                <label class="filtro-label"><i class="fa-solid fa-calendar"></i> Data</label>
                                <div class="select-btn">
                                    <span class="btn-texto">Qualquer data</span>
                                    <span class="seta"><i class="fa-solid fa-angle-down"></i></span>
                                </div>
                                <div class="select-dropdown">
                                    <div class="option" data-value="qualquer">Qualquer data</div>
                                    <div class="option" data-value="semana">Última semana</div>
                                    <div class="option" data-value="mes">Último mês</div>
                                    <div class="option" data-value="trimestre">Últimos três meses</div>
                                    <div class="option" data-value="personalizado">Personalizado</div>
                                </div>
                            </div>

                            <div class="filtro-datas-custom oculto" id="grupoDatasCustom">
                                <div class="campo-data">
                                    <label for="data-inicio">Data inicial</label>
                                    <div class="input-icone-wrapper">
                                        <input type="text" id="data-inicio" placeholder="DD/MM/AAAA" autocomplete="off">
                                        <i class="fa-regular fa-calendar"></i>
                                    </div>
                                </div>
                                <div class="divisor-datas"><hr></div>
                                <div class="campo-data">
                                    <label for="data-fim">Data final</label>
                                    <div class="input-icone-wrapper">
                                        <input type="text" id="data-fim" placeholder="DD/MM/AAAA" autocomplete="off">
                                        <i class="fa-regular fa-calendar"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="filtro-acoes">
                        <button type="button" class="btn-limpar-filtros" id="btnLimparFiltros">
                            <i class="fi fi-rr-broom"></i><span>Limpar</span>
                        </button>
                        <button type="button" class="btn-aplicar-filtros" id="btnAplicarFiltros">
                            <i class="fi fi-rr-search-alt"></i><span>Aplicar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="btns-view" id="btnsView">
            <span class="indicador"></span>
            <button type="button" class="btn-view ativo" id="btnCards" title="Visualização em Grade"><i class="fi fi-sr-apps"></i></button>
            <button type="button" class="btn-view" id="btnList" title="Visualização em Lista"><i class="fi fi-br-list"></i></button>
        </div>
        `;
    }
}
if (!customElements.get("search-bar")) customElements.define("search-bar", SearchComponent);

class OrdenarComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="info-pesquisa">
            <p class="qtd-itens">Resultados encontrados: <span>0 itens</span></p>
            <div class="campo campo-select campo-ordenar" id="campoOrdenar">
                <div class="custom-select">
                    <input type="hidden" name="ordem" id="ordem-selecionada" value="recente">
                    <label class="label-ordenar" for="ordem-btn">Ordenar por:</label>
                    <div class="select-btn" id="ordem-btn">
                        <span class="btn-texto"><i class="fa-solid fa-arrow-down-wide-short"></i> Mais recentes</span>
                        <span class="seta"><i class="fa-solid fa-angle-down"></i></span>
                    </div>
                    <div class="select-dropdown">
                        <div class="option" data-value="recente"><i class="fa-solid fa-arrow-down-wide-short"></i> Mais recentes</div>
                        <div class="option" data-value="antiga"><i class="fa-solid fa-arrow-up-wide-short"></i> Mais antigos</div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("ordenar-itens")) customElements.define("ordenar-itens", OrdenarComponent);

const GerenciadorBusca = (() => {
    let fpInicio = null;
    let fpFim = null;
    let callbackFiltro = null;
    let callbackOrdenacao = null;

    function normalizar(texto) {
        return (texto || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    function obterFiltrosAtuais() {
        const inputBusca = document.getElementById('search-input');
        return {
            termo: normalizar(inputBusca ? inputBusca.value : ''),
            categoria: normalizar(document.getElementById('categoria-selecionada')?.value || ''),
            cor: normalizar(document.getElementById('cor-selecionada')?.value || ''),
            tipoData: document.getElementById('data-selecionada')?.value || 'qualquer',
            dataInicio: document.getElementById('data-inicio')?.value || '',
            dataFim: document.getElementById('data-fim')?.value || '',
            ordem: document.getElementById('ordem-selecionada')?.value || 'recente'
        };
    }

    function checarFiltrosAtivos() {
        const btnToggleFiltros = document.getElementById('btnToggleFiltros');
        if (!btnToggleFiltros) return;

        const cat = document.getElementById('categoria-selecionada')?.value;
        const cor = document.getElementById('cor-selecionada')?.value;
        const data = document.getElementById('data-selecionada')?.value;
        const dtInicio = document.getElementById('data-inicio')?.value.trim();
        const dtFim = document.getElementById('data-fim')?.value.trim();

        const temFiltroAtivo = !!cat || !!cor || ['semana', 'mes', 'trimestre'].includes(data) || (data === 'personalizado' && (!!dtInicio || !!dtFim));
        btnToggleFiltros.classList.toggle('ativo', temFiltroAtivo);

        const icone = btnToggleFiltros.querySelector('i');
        if (icone) icone.className = temFiltroAtivo ? 'fi fi-sr-settings-sliders' : 'fi fi-rr-settings-sliders';
    }

    function alternarPainelFiltros() {
        const painelFiltros = document.getElementById('painelFiltros');
        const setaFiltro = document.getElementById('setaFiltro');
        if (!painelFiltros) return;

        const fechado = painelFiltros.classList.toggle('oculto');
        if (setaFiltro) setaFiltro.classList.toggle('invertida', fechado);
    }

    function configurarSelectFiltro(containerId, onSelectCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const btn = container.querySelector('.select-btn');
        const dropdown = container.querySelector('.select-dropdown');
        const textoVisivel = container.querySelector('.btn-texto');
        const inputHidden = container.querySelector('input[type="hidden"]');
        const options = container.querySelectorAll('.option');

        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select .select-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('mostrar');
            });
            document.querySelectorAll('.custom-select .select-btn').forEach(b => {
                if (b !== btn) b.classList.remove('ativo');
            });

            btn.classList.toggle('ativo');
            dropdown?.classList.toggle('mostrar');
        });

        options.forEach(opcao => {
            opcao.addEventListener('click', (e) => {
                e.stopPropagation();
                const valor = opcao.getAttribute('data-value') || '';
                if (inputHidden) inputHidden.value = valor;
                if (textoVisivel) textoVisivel.innerHTML = opcao.innerHTML.trim();

                btn.classList.remove('ativo');
                dropdown?.classList.remove('mostrar');

                if (onSelectCallback) onSelectCallback(valor);
            });
        });
    }

    function resetarSelectFiltro(containerId, valorPadrao, textoPadraoHtml) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const inputHidden = container.querySelector('input[type="hidden"]');
        const btnTexto = container.querySelector('.btn-texto');
        const dropdown = container.querySelector('.select-dropdown');
        const btn = container.querySelector('.select-btn');

        if (inputHidden) inputHidden.value = valorPadrao;
        if (btnTexto) btnTexto.innerHTML = textoPadraoHtml;

        btn?.classList.remove('ativo');
        dropdown?.classList.remove('mostrar');
    }

    function inicializarAlternanciaVisualizacao(obterRaizAtiva) {
        const btnsContainer = document.getElementById('btnsView');
        const btnCards = document.getElementById('btnCards');
        const btnList = document.getElementById('btnList');

        function aplicarModo(modo) {
            const raiz = obterRaizAtiva ? obterRaizAtiva() : document;
            const viewCards = raiz.querySelector('#viewCards') || document.getElementById('viewCards');
            const viewTable = raiz.querySelector('#viewTable') || document.getElementById('viewTable');

            if (modo === 'lista') {
                btnList?.classList.add('ativo');
                btnCards?.classList.remove('ativo');
                btnsContainer?.classList.add('em-lista');
                viewCards?.classList.add('oculto');
                viewTable?.classList.remove('oculto');
            } else {
                btnCards?.classList.add('ativo');
                btnList?.classList.remove('ativo');
                btnsContainer?.classList.remove('em-lista');
                viewTable?.classList.add('oculto');
                viewCards?.classList.remove('oculto');
            }
        }

        if (btnsContainer) {
            btnsContainer.classList.add('sem-transicao');
            const modoSalvo = localStorage.getItem('modoVisualizacao') || 'cards';
            aplicarModo(modoSalvo);
            void btnsContainer.offsetHeight;
            btnsContainer.classList.remove('sem-transicao');

            btnCards?.addEventListener('click', () => {
                aplicarModo('cards');
                localStorage.setItem('modoVisualizacao', 'cards');
            });

            btnList?.addEventListener('click', () => {
                aplicarModo('lista');
                localStorage.setItem('modoVisualizacao', 'lista');
            });
        }
    }

    function init({ onBuscarEFiltros, onOrdenar, obterRaizAtiva }) {
        callbackFiltro = onBuscarEFiltros;
        callbackOrdenacao = onOrdenar;

        const inputBusca = document.getElementById('search-input');
        const btnToggleFiltros = document.getElementById('btnToggleFiltros');
        const fecharFiltrosHeader = document.getElementById('fecharFiltrosHeader');
        const btnLimpar = document.getElementById('btnLimparFiltros');
        const btnAplicar = document.getElementById('btnAplicarFiltros');
        const btnBuscar = document.querySelector('.btn-buscar');
        const grupoDatasCustom = document.getElementById('grupoDatasCustom');
        const painelFiltros = document.getElementById('painelFiltros');

        const dispararBusca = () => {
            if (callbackFiltro) callbackFiltro(obterFiltrosAtuais());
            checarFiltrosAtivos();
        };

        inputBusca?.addEventListener('input', dispararBusca);
        btnBuscar?.addEventListener('click', (e) => {
            e.preventDefault();
            dispararBusca();
        });

        btnToggleFiltros?.addEventListener('click', (e) => {
            e.stopPropagation();
            alternarPainelFiltros();
        });

        fecharFiltrosHeader?.addEventListener('click', (e) => {
            e.stopPropagation();
            alternarPainelFiltros();
        });

        document.addEventListener('click', (e) => {
            if (painelFiltros && !painelFiltros.classList.contains('oculto')) {
                const clicouDentro = painelFiltros.contains(e.target);
                const clicouBotao = btnToggleFiltros && btnToggleFiltros.contains(e.target);
                const clicouCalendario = e.target.closest('.flatpickr-calendar');

                if (!clicouDentro && !clicouBotao && !clicouCalendario) {
                    painelFiltros.classList.add('oculto');
                    document.getElementById('setaFiltro')?.classList.add('invertida');
                }
            }
        });

        configurarSelectFiltro('campoOrdenar', (valor) => {
            if (callbackOrdenacao) callbackOrdenacao(valor);
        });

        configurarSelectFiltro('campoFiltroCategoria', dispararBusca);
        configurarSelectFiltro('campoFiltroCor', dispararBusca);
        configurarSelectFiltro('campoFiltroData', (valor) => {
            if (valor === 'personalizado') {
                grupoDatasCustom?.classList.remove('oculto');
            } else {
                grupoDatasCustom?.classList.add('oculto');
                const inInicio = document.getElementById('data-inicio');
                const inFim = document.getElementById('data-fim');
                if (inInicio) inInicio.value = '';
                if (inFim) inFim.value = '';
                if (fpInicio) fpInicio.clear();
                if (fpFim) fpFim.clear();
            }
            dispararBusca();
        });

        btnAplicar?.addEventListener('click', (e) => {
            e.preventDefault();
            dispararBusca();
            painelFiltros?.classList.add('oculto');
        });

        // -------------------------------------------------------------
        // CORREÇÃO DO BOTÃO LIMPAR
        // -------------------------------------------------------------
        btnLimpar?.addEventListener('click', () => {
            resetarSelectFiltro('campoFiltroCategoria', '', 'Todas');
            resetarSelectFiltro('campoFiltroCor', '', 'Todas');
            resetarSelectFiltro('campoFiltroData', 'qualquer', 'Qualquer data');

            const inInicio = document.getElementById('data-inicio');
            const inFim = document.getElementById('data-fim');
            
            if (inInicio) inInicio.value = '';
            if (inFim) inFim.value = '';
            
            // Força a limpeza visual do flatpickr
            if (fpInicio) fpInicio.clear();
            if (fpFim) fpFim.clear();

            grupoDatasCustom?.classList.add('oculto');

            if (inputBusca) inputBusca.value = '';

            // Força reset visual do ícone de filtro
            if (btnToggleFiltros) {
                btnToggleFiltros.classList.remove('ativo');
                const icone = btnToggleFiltros.querySelector('i');
                if (icone) icone.className = 'fi fi-rr-settings-sliders';
            }

            dispararBusca();
        });

        const inputDataInicio = document.getElementById('data-inicio');
        const inputDataFim = document.getElementById('data-fim');
        if (typeof GerenciadorDatas !== 'undefined') {
            if (inputDataInicio) fpInicio = GerenciadorDatas.anexar(inputDataInicio, { onChange: dispararBusca });
            if (inputDataFim) fpFim = GerenciadorDatas.anexar(inputDataFim, { onChange: dispararBusca });
        }

        inicializarAlternanciaVisualizacao(obterRaizAtiva);
        checarFiltrosAtivos();
    }

    return { init, obterFiltrosAtuais, checarFiltrosAtivos };
})();

window.GerenciadorBusca = GerenciadorBusca;