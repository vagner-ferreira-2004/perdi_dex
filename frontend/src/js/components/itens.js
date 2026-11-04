/* ==========================================================
   COMPONENTES E RENDERIZAÇÃO DE ITENS (CARDS & TABELA)
   ========================================================== */

const TemplatesItens = {
    gerarHtml: (comStatus = false) => `
        <div class="cards_container" id="viewCards"></div>

        <template id="cardTemplate">
            <div class="card-item">
                <div class="foto">
                    <img src="" alt="" class="card-img">
                    <div class="categoria"><i class="fa-solid fa-box"></i><span class="card-categoria"></span></div>
                    <div class="status"><i class="fa-solid fa-check"></i><span class="card-status"></span></div>
                </div>
                <div class="info">
                    <div class="descricao"><p class="texto limitado card-texto"></p></div>
                    <div class="atributos">
                        <span class="local"><i class="fa-solid fa-location-dot"></i><p class="card-local"></p></span>
                        <span class="data"><i class="fa-solid fa-calendar"></i><p class="card-data"></p></span>
                        <span class="cor"><div class="space-color card-cor-bolinha"></div><p class="card-cor-nome"></p></span>
                        <span class="marca"><i class="fa-solid fa-tag"></i><p class="card-marca"></p></span>
                    </div>
                    <div class="btns"></div>
                </div>
            </div>
        </template>

        <div class="table_container oculto" id="viewTable">
            <table class="tabela-itens">
                <thead>
                    <tr>
                        <th class="th-foto">Foto</th>
                        <th class="th-nome">Descrição</th>
                        <th class="th-local-data">Local e Data</th>
                        <th class="th-cor-marca">Cor e Marca</th>
                        <th class="th-categoria">${comStatus ? 'Categoria e Status' : 'Categoria'}</th>
                        <th class="th-acoes">Ações</th>
                    </tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>
        </div>

        <template id="linhaTabelaTemplate">
            <tr class="tabela-item-linha">
                <td class="td-foto"><img src="" alt="" class="thumb-foto tabela-img"></td>
                <td class="td-nome"><p class="desc-nome tabela-texto"></p></td>
                <td class="td-local-data">
                    <div class="info-dupla">
                        <span class="info-item local"><i class="fa-solid fa-location-dot"></i><span class="tabela-local"></span></span>
                        <span class="info-item data"><i class="fa-solid fa-calendar"></i><span class="tabela-data"></span></span>
                    </div>
                </td>
                <td class="td-cor-marca">
                    <div class="info-dupla">
                        <span class="info-item cor"><div class="space-color tabela-cor-bolinha"></div><span class="tabela-cor-nome"></span></span>
                        <span class="info-item marca"><i class="fa-solid fa-tag"></i><span class="tabela-marca"></span></span>
                    </div>
                </td>
                <td class="td-categoria">
                    ${comStatus 
                        ? `<div class="info-dupla">
                               <span class="categoria"><i class="fa-solid fa-box"></i><span class="tabela-categoria"></span></span>
                               <span class="status"><i class="fa-solid fa-check"></i><span class="tabela-status"></span></span>
                           </div>` 
                        : `<div class="categoria"><i class="fa-solid fa-box"></i><span class="tabela-categoria"></span></div>`
                    }
                </td>
                <td class="td-acoes">
                    <div class="acoes-wrapper"></div>
                </td>
            </tr>
        </template>
    `
};


class TodosItensComponent extends HTMLElement {
    connectedCallback() {
        if (window.location.pathname.includes('/admin/')) {
            this.innerHTML = `
            <div class="filtros-status-wrapper" id="filtrosStatus">
                <button type="button" class="btn-tab-status ativo" data-status="todos"><span>Todos</span><span class="badge-qtd" id="qtd-todos">0</span></button>
                <button type="button" class="btn-tab-status" data-status="analise"><span>Em análise</span><span class="badge-qtd" id="qtd-analise">0</span></button>
                <button type="button" class="btn-tab-status" data-status="aprovado"><span>Publicados</span><span class="badge-qtd" id="qtd-aprovado">0</span></button>
                <button type="button" class="btn-tab-status" data-status="reprovado"><span>Reprovados</span><span class="badge-qtd" id="qtd-reprovado">0</span></button>
                <button type="button" class="btn-tab-status" data-status="devolvido"><span>Devolvidos</span><span class="badge-qtd" id="qtd-devolvido">0</span></button>
            </div>
            <div class="area-definicao">
                <div class="definicao-status todos ativo"><i class="fa-solid fa-border-all"></i><span>Todos os itens ativos no sistema</span></div>
                <div class="definicao-status analises"><i class="fa-solid fa-hourglass"></i><span>Cadastros aguardando avaliação</span></div>
                <div class="definicao-status aprovados"><i class="fa-solid fa-check"></i><span>Itens publicados</span></div>
                <div class="definicao-status reprovados"><i class="fa-solid fa-xmark"></i><span>Cadastros reprovados</span></div>
                <div class="definicao-status devolvidos"><i class="fa-solid fa-arrow-rotate-left"></i><span>Itens devolvidos</span></div>
            </div>
            ${TemplatesItens.gerarHtml(true)}
            `;
            return;
        }
        this.innerHTML = `
        <div class="filtros-status-wrapper" id="filtrosStatus">
            <button type="button" class="btn-tab-status ativo" data-status="todos"><span>Todos</span><span class="badge-qtd" id="qtd-todos">0</span></button>
            
            <!-- Alterado "aprovado" para "perdido" -->
            <button type="button" class="btn-tab-status" data-status="perdidos"><span class="ponto-status perdido"></span><span>Perdidos</span><span class="badge-qtd" id="qtd-perdidos">0</span></button>
            
            <!-- Alterado "resgatado" para "achado" -->
            <button type="button" class="btn-tab-status" data-status="achados"><span class="ponto-status achado"></span><span>Achados</span><span class="badge-qtd" id="qtd-achados">0</span></button>
        </div>

        <div class="area-definicao">
            <div class="definicao-status todos ativo"><i class="fa-solid fa-border-all"></i><span>Todos os itens disponíveis ou já entregues no sistema</span></div>
            <div class="definicao-status perdidos"><i class="fa-solid fa-magnifying-glass"></i><span>Itens perdidos aguardando o resgate pelo dono</span></div>
            <div class="definicao-status achados"><i class="fa-solid fa-check-double"></i><span>Itens que já foram devolvidos ou resgatados</span></div>
        </div>

        ${TemplatesItens.gerarHtml(true)}
        `;
    }
}
if (!customElements.get("todos-itens")) customElements.define("todos-itens", TodosItensComponent);


class MeusItensComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="filtros-status-wrapper" id="filtrosStatus">
            <button type="button" class="btn-tab-status ativo" data-status="todos"><span>Todos</span><span class="badge-qtd" id="qtd-todos">0</span></button>
            <button type="button" class="btn-tab-status" data-status="analise"><span class="ponto-status analise"></span><span>Em análise</span><span class="badge-qtd" id="qtd-analise">0</span></button>
            <button type="button" class="btn-tab-status" data-status="aprovado"><span class="ponto-status aprovado"></span><span>Aprovados</span><span class="badge-qtd" id="qtd-aprovado">0</span></button>
            <button type="button" class="btn-tab-status" data-status="reprovado"><span class="ponto-status reprovado"></span><span>Reprovados</span><span class="badge-qtd" id="qtd-reprovado">0</span></button>
            <button type="button" class="btn-tab-status" data-status="devolvido"><span class="ponto-status devolvido"></span><span>Devolvidos</span><span class="badge-qtd" id="qtd-devolvido">0</span></button>
            <button type="button" class="btn-tab-status" data-status="solicitado"><span class="ponto-status solicitado"></span><span>Solicitados</span><span class="badge-qtd" id="qtd-solicitado">0</span></button>
            <button type="button" class="btn-tab-status" data-status="resgatado"><span class="ponto-status resgatado"></span><span>Resgatados</span><span class="badge-qtd" id="qtd-resgatado">0</span></button>
        </div>

        <div class="area-definicao">
            <div class="definicao-status todos ativo"><i class="fa-solid fa-border-all"></i><span>Todos os meus cadastros e solicitações de itens no sistema</span></div>
            <div class="definicao-status analises"><i class="fa-solid fa-hourglass"></i><span>Cadastros aguardando avaliação</span></div>
            <div class="definicao-status aprovados"><i class="fa-solid fa-check"></i><span>Cadastros aprovados pela administração</span></div>
            <div class="definicao-status reprovados"><i class="fa-solid fa-xmark"></i><span>Cadastros reprovados pela administração</span></div>
            <div class="definicao-status devolvidos"><i class="fa-solid fa-arrow-rotate-left"></i><span>Itens que já foram devolvidos aos donos</span></div>
            <div class="definicao-status resgatados"><i class="fa-solid fa-location-crosshairs"></i><span>Meus pertences que foram resgatados</span></div>
            <div class="definicao-status solicitados"><i class="fa-solid fa-hand"></i><span>Itens com resgate solicitado</span></div>
        </div>

        ${TemplatesItens.gerarHtml(true)}
        `;
    }
}
if (!customElements.get("meus-itens")) customElements.define("meus-itens", MeusItensComponent);

const GerenciadorItens = (() => {
    function ehPaginaMeusItens() {
        return document.querySelector('meus-itens') !== null;
    }

    function obterRaizAtiva() {
        return document.querySelector('meus-itens') || document.querySelector('todos-itens') || document;
    }

    function gerarBotoesAcao(item, modoTabela = false) {
        const status = item.status;
        const tDetalhes = modoTabela ? '<span>Detalhes</span>' : '';

        if (!ehPaginaMeusItens()) {
            if (window.PerdidexUser?.role === 'admin') {
                return `<button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>`;
            }
            if (status === 'aprovado') {
                return `
                    <button type="button" class="btn-resgatar" title="Solicitar resgate deste item"><span>Solicitar resgate</span><i class="fa-solid fa-arrow-right"></i></button>
                    <button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>
                `;
            } else if (status === 'solicitado' && item.usuarioSolicitou) {
                return `<button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>`;
            } else if (status === 'devolvido') {
                return `
                    <button type="button" class="btn-contestar" title="Contestar a propriedade deste item"><span>Contestar propriedade</span><i class="fa-solid fa-arrow-right"></i></button>
                    <button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>
                `;
            }
            return `<button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>`;
        }

        const tEditar = modoTabela ? '<span>Editar</span>' : '';
        const tExcluir = modoTabela ? '<span>Excluir</span>' : '';
        const tCancelar = modoTabela ? '<span>Cancelar</span>' : '';
        const tComprovante = modoTabela ? '<span>Comprovante</span>' : '';

        if (['aprovado', 'reprovado', 'analise'].includes(status)) {
            return `
                <button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>
                <button type="button" class="btn-editar" title="Editar Item">${tEditar}<i class="fa-regular fa-pen-to-square"></i></button>
                <button type="button" class="btn-excluir" title="Excluir Item">${tExcluir}<i class="fa-regular fa-trash-can"></i></button>
            `;
        }

        if (status === 'devolvido') {
            return `<button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>`;
        }

        if (status === 'solicitado') {
            let botoesHTML = `<button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>`;
            if (item.estadoSolicitacao === 'aprovado') {
                botoesHTML += `<button type="button" class="btn-comprovante" title="Ver Comprovante">${tComprovante}<i class="fi fi-br-receipt"></i></button>`;
            } else if (item.estadoSolicitacao === 'pendente') {
                botoesHTML += `<button type="button" class="btn-cancelar-solicitacao" title="Retirar Solicitação">${tCancelar}<i class="fa-solid fa-ban"></i></button>`;
            }
            return botoesHTML;
        }

        if (status === 'resgatado') {
            return `
                <button type="button" class="btn-detalhes" title="Ver Detalhes">${tDetalhes}<i class="fi fi-br-info"></i></button>
                <button type="button" class="btn-comprovante" title="Ver Comprovante">${tComprovante}<i class="fi fi-br-receipt"></i></button>
            `;
        }

        return '';
    }

    function renderizarCards(lista) {
        const raiz = obterRaizAtiva();
        const containerCards = raiz.querySelector('#viewCards') || document.getElementById('viewCards');
        const templateCard = raiz.querySelector('#cardTemplate') || document.getElementById('cardTemplate');

        if (!containerCards || !templateCard) return;

        containerCards.innerHTML = '';
        if (lista.length === 0) {
            containerCards.innerHTML = `
                <div class="nenhum-item">
                    <i class="fa-solid fa-inbox"></i>
                    <h5>Nenhum item encontrado</h5>
                    <p>Quando houver itens vão aparecer nesta grade.</p>
                </div>
            `;
            return;
        }

        const isMeusItens = ehPaginaMeusItens();
        lista.forEach(item => {
            const clone = templateCard.content.cloneNode(true);
            clone.querySelector('.card-item').setAttribute('data-id', item.id);

            const img = clone.querySelector('.card-img');
            img.src = item.foto;
            img.alt = item.categoria;

            clone.querySelector('.card-categoria').textContent = item.categoria;
            clone.querySelector('.card-texto').textContent = item.descricao;
            clone.querySelector('.card-local').textContent = item.local;
            clone.querySelector('.card-data').textContent = item.data;
            clone.querySelector('.card-cor-nome').textContent = item.corNome;
            clone.querySelector('.card-marca').textContent = item.marca?.trim() || 'Desconhecida';

            const bolinha = clone.querySelector('.card-cor-bolinha');
            if (bolinha) bolinha.className = `space-color ${item.corClasse}`;

            const boxStatus = clone.querySelector('.status');
            if (boxStatus) {
                let statusChave = item.status;
                if (!isMeusItens) {
                    statusChave = item.usuarioSolicitou
                        ? 'solicitado'
                        : (item.status === 'aprovado') ? 'perdido' : 'achado';
                }

                const conf = GerenciadorModais?.formatacaoStatus[statusChave] || { rotulo: statusChave, classe: statusChave, icone: 'fa-solid fa-circle-question' };
                boxStatus.className = `status ${conf.classe}`;
                boxStatus.innerHTML = `<i class="${conf.icone}"></i><span class="card-status">${conf.rotulo}</span>`;
            }

            const containerBtns = clone.querySelector('.btns');
            if (containerBtns) containerBtns.innerHTML = gerarBotoesAcao(item, false);

            containerCards.appendChild(clone);
        });
    }

    function renderizarTabela(lista) {
        const raiz = obterRaizAtiva();
        const tbody = raiz.querySelector('#tableBody') || document.getElementById('tableBody');
        const templateLinha = raiz.querySelector('#linhaTabelaTemplate') || document.getElementById('linhaTabelaTemplate');

        if (!tbody || !templateLinha) return;

        tbody.innerHTML = '';
        if (lista.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="nenhum-item">
                            <i class="fa-solid fa-inbox"></i>
                            <h5>Nenhum item encontrado</h5>
                            <p>Quando houver itens vão aparecer nesta grade.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const isMeusItens = ehPaginaMeusItens();
        lista.forEach(item => {
            const clone = templateLinha.content.cloneNode(true);
            clone.querySelector('.tabela-item-linha').setAttribute('data-id', item.id);

            const img = clone.querySelector('.tabela-img');
            img.src = item.foto;
            img.alt = item.categoria;

            clone.querySelector('.tabela-texto').textContent = item.descricao;
            clone.querySelector('.tabela-local').textContent = item.local;
            clone.querySelector('.tabela-data').textContent = item.data;
            clone.querySelector('.tabela-cor-nome').textContent = item.corNome;
            clone.querySelector('.tabela-marca').textContent = item.marca?.trim() || 'Desconhecida';
            clone.querySelector('.tabela-categoria').textContent = item.categoria;

            const bolinha = clone.querySelector('.tabela-cor-bolinha');
            if (bolinha) bolinha.className = `space-color ${item.corClasse}`;

            const boxStatus = clone.querySelector('.status');
            if (boxStatus) {
                let statusChave = item.status;
                if (!isMeusItens) {
                    statusChave = item.usuarioSolicitou
                        ? 'solicitado'
                        : (item.status === 'aprovado') ? 'perdido' : 'achado';
                }

                const conf = GerenciadorModais?.formatacaoStatus[statusChave] || { rotulo: statusChave, classe: statusChave, icone: 'fa-solid fa-circle-question' };
                boxStatus.className = `status ${conf.classe}`;
                boxStatus.innerHTML = `<i class="${conf.icone}"></i><span class="tabela-status">${conf.rotulo}</span>`;
            }

            const containerAcoes = clone.querySelector('.acoes-wrapper');
            if (containerAcoes) containerAcoes.innerHTML = gerarBotoesAcao(item, true);

            tbody.appendChild(clone);
        });
    }

    function renderizar(lista) {
        renderizarCards(lista);
        renderizarTabela(lista);

        const elResumo = document.querySelector('.resultados-encontrados') || document.querySelector('.qtd-itens span');
        if (elResumo) {
            const total = lista.length;
            const txt = total === 1 ? 'item' : 'itens';
            elResumo.innerHTML = elResumo.tagName === 'SPAN' ? `${total} ${txt}` : `Resultados encontrados: <span>${total} ${txt}</span>`;
        }
    }

    return { renderizar, ehPaginaMeusItens, obterRaizAtiva };
})();

window.GerenciadorItens = GerenciadorItens;