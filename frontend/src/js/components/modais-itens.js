/* ==========================================================
   MÓDULO CENTRAL DE NOTIFICAÇÕES (TOAST)
   ========================================================== */
const GerenciadorToast = (() => {
    let timerToast = null;

    function inicializar() {
        if (!document.getElementById('toastNotificacao')) {
            const toast = document.createElement('div');
            toast.className = 'toast-notificacao';
            toast.id = 'toastNotificacao';
            document.body.appendChild(toast);
        }
    }

    function exibir(mensagem, duracao = 3000, erro = false) {
        inicializar();
        const toast = document.getElementById('toastNotificacao');
        const icon = document.createElement('i');
        icon.className = erro ? 'fa-solid fa-circle-exclamation' : 'fa-regular fa-circle-check';
        icon.style.marginRight = '8px';
        const text = document.createElement('span');
        text.textContent = mensagem;
        toast.replaceChildren(icon, text);
        toast.classList.add('visivel');
        
        clearTimeout(timerToast);
        timerToast = setTimeout(() => {
            toast.classList.remove('visivel');
        }, duracao);
    }

    return { exibir };
})();
window.GerenciadorToast = GerenciadorToast;


/* ==========================================================
   UTILITÁRIO GLOBAL DE INICIAIS DO AVATAR
   ========================================================== */
window.obterIniciaisNome = function(nomeCompleto) {
    if (!nomeCompleto) return 'NS';
    const partes = nomeCompleto.trim().split(' ').filter(Boolean);
    if (partes.length === 0) return 'U';
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};


/* ==========================================================
   COMPONENTES HTML DOS MODAIS
   ========================================================== */

class ModalDestalhesComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="modal-detalhes" id="modalDetalhes">
            <div class="modal-conteudo">
                <button type="button" class="modal-fechar" id="modalFechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-grid">
                    <div class="modal-foto-box"><img src="" alt="" class="modal-img" id="modalImg"></div>
                    <div class="modal-info">
                        <div class="modal-corpo-rolavel">
                            <div class="modal-descricao-wrapper">
                                <p class="modal-desc-texto limitado" id="modalDescricao"></p>
                                <button type="button" class="modal-btn-ler-mais" id="modalBtnToggle">Ler mais</button>
                            </div>
                            <div class="modal-atributos-lista">
                                <div class="attr-linha categoria">
                                    <div class="attr-icone"><i class="fa-solid fa-box"></i></div>
                                    <div class="attr-dados"><span class="attr-rotulo">Categoria</span><span class="attr-valor" id="modalCategoria"></span></div>
                                </div>
                                <div class="attr-linha local">
                                    <div class="attr-icone"><i class="fa-solid fa-location-dot"></i></div>
                                    <div class="attr-dados"><span class="attr-rotulo">Local</span><span class="attr-valor" id="modalLocal"></span></div>
                                </div>
                                <div class="attr-linha data">
                                    <div class="attr-icone"><i class="fa-solid fa-calendar"></i></div>
                                    <div class="attr-dados"><span class="attr-rotulo">Data</span><span class="attr-valor" id="modalData"></span></div>
                                </div>
                                <div class="attr-linha">
                                    <div class="attr-icone"><div class="space-color" id="modalCorVisual"></div></div>
                                    <div class="attr-dados"><span class="attr-rotulo">Cor principal</span><span class="attr-valor" id="modalCorTexto"></span></div>
                                </div>
                                <div class="attr-linha marca">
                                    <div class="attr-icone"><i class="fa-solid fa-tag"></i></div>
                                    <div class="attr-dados"><span class="attr-rotulo">Marca</span><span class="attr-valor" id="modalMarca"></span></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-status-badge"><span id="modalStatus"></span></div>
                        <div id="modalAvisoSolicitacao" style="display:none;"></div>
                        
                        <!-- BOTÕES DE AÇÃO DO DETALHE -->
                        <button type="button" class="btn-resgatar-vermelho" id="btnAcaoDetalhesResgatar"><span>Resgatar</span><i class="fa-solid fa-arrow-right"></i></button>
                        <button type="button" class="btn-contestar-laranja" id="btnAcaoDetalhesContestar"><span>Contestar</span><i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-detalhes")) customElements.define("modal-detalhes", ModalDestalhesComponent);

class ModalResgateComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="modal-resgate modal-resgatar" id="modalResgate">
            <div class="modal-resgate-conteudo">
                <button type="button" class="modal-resgate-fechar" id="modalResgateFechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-resgate-cabecalho">
                    <div class="icone-resgate-topo"><i class="fi fi-sr-box-alt"></i></div>
                    <div class="titulos-resgate">
                        <h3>Solicitação de resgate</h3>
                        <p>Você tem certeza que deseja solicitar o resgate deste item?</p>
                    </div>
                </div>
                <div class="resgate-card-preview">
                    <div class="resgate-foto-wrapper"><img src="" alt="Foto do item" id="resgateImg"></div>
                    <div class="resgate-dados-wrapper">
                        <p class="resgate-descricao-texto" id="resgateDescricao"></p>
                        
                        <div class="area-atributos">
                            <div class="resgate-categoria-badge"><i class="fa-solid fa-box"></i><span id="resgateCategoriaTexto"></span></div>
                            <div class="modal-status-badge"><span id="resgateStatus"></span></div>
                        </div>
                    </div>
                </div>
                <div class="resgate-aviso-info">
                    <i class="fa-solid fa-circle-info"></i>
                    <div class="texto-aviso">
                        <strong>Ao solicitar o resgate, sua solicitação será enviada para o administrador.</strong>
                        <p>Você receberá uma notificação com as orientações assim que houver uma resposta.</p>
                    </div>
                </div>
                <div class="modal-resgate-acoes">
                    <button type="button" class="btn-cancelar-resgate" id="btnCancelarResgate"><span>Cancelar</span></button>
                    <button type="button" class="btn-confirmar-resgate" id="btnConfirmarResgate"><span>Solicitar resgate</span><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-resgate")) customElements.define("modal-resgate", ModalResgateComponent);

class ModalContestarComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="modal-resgate modal-contestar" id="modalContestar">
            <div class="modal-resgate-conteudo">
                <button type="button" class="modal-resgate-fechar" id="modalContestarFechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-resgate-cabecalho">
                    <div class="icone-resgate-topo"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="titulos-resgate">
                        <h3>Solicitação para Contestar Entrega</h3>
                        <p>Acha que este item é seu, mas já foi entregue a outra pessoa?</p>
                    </div>
                </div>
                <div class="resgate-card-preview">
                    <div class="resgate-foto-wrapper"><img src="" alt="Foto do item" id="contestarImg"></div>
                    <div class="resgate-dados-wrapper">
                        <p class="resgate-descricao-texto" id="contestarDescricao"></p>
                        
                        <div class="area-atributos">
                            <div class="resgate-categoria-badge"><i class="fa-solid fa-box"></i><span id="contestarCategoriaTexto"></span></div>
                            <div class="modal-status-badge"><span id="contestarStatus"></span></div>
                        </div>
                    </div>
                </div>
                <div class="resgate-aviso-info">
                    <i class="fa-solid fa-circle-info"></i>
                    <div class="texto-aviso">
                        <strong>Descreva por que você acredita ser o proprietário.</strong>
                        <p>Inclua detalhes que ajudem a identificar o item. Você pode anexar até 3 imagens, com no máximo 10 MB cada.</p>
                    </div>
                </div>
                <div class="campo campo-textarea">
                    <label for="contestacaoDescricao">Descrição da contestação</label>
                    <textarea id="contestacaoDescricao" maxlength="2000" minlength="20" required
                        placeholder="Informe detalhes que comprovem a propriedade (mínimo 20 caracteres)"></textarea>
                </div>
                <div class="campo">
                    <label for="contestacaoEvidencias">Evidências (opcional, até 3 imagens)</label>
                    <input type="file" id="contestacaoEvidencias" accept="image/png,image/jpeg,image/webp,image/avif" multiple>
                    <small id="contestacaoEvidenciasAjuda">Cada arquivo deve ter até 10 MB.</small>
                </div>
                <div class="modal-resgate-acoes">
                    <button type="button" class="btn-cancelar-resgate" id="btnCancelarContestar"><span>Cancelar</span></button>
                    <button type="button" class="btn-confirmar-resgate" id="btnConfirmarContestar"><span>Enviar Contestação</span><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-contestar-item")) customElements.define("modal-contestar-item", ModalContestarComponent);

class ModalEditarItemComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id="modalEditar" class="modal-overlay modal-editar">
            <div class="modal-container modal-editar-container">
                <button type="button" class="modal-btn-fechar" id="modalEditarFechar" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-header">
                    <div class="tipo-modal">
                        <i class="fa-solid fa-pen"></i>
                        <span><h3>Editar Item</h3><p>Modifique as informações do item encontrado.</p></span>
                    </div>
                    <div class="modal-status-badge"><span id="editItemStatus"></span></div>
                </div>
                <div class="modal-corpo">
                    <form id="formEditarItem" class="cadastro cadastro-edicao" onsubmit="return false;">
                        <div class="coluna coluna1">
                            <div class="upload-container campo campo-foto">
                                <label>Foto do Item</label>
                                <div class="upload-box">
                                    <img id="editItemFoto" class="upload-preview" alt="Prévia" style="display: block; width: 100%; height: 100%; object-fit: cover;" />
                                    <div class="upload-placeholder" style="display: none;">
                                        <i class="fa-regular fa-camera upload-icon"></i>
                                        <span class="title">Clique para alterar a foto</span>
                                        <span class="subtitle">PNG, JPG, JPEG, WEBP ou AVIF <br> (máx. 10 MB)</span>
                                    </div>
                                    <input type="file" name="edit_foto[]" id="editUploadInput" class="upload-input" accept="image/png, image/jpg, image/jpeg, image/webp, image/avif" hidden>
                                </div>
                                <span class="upload-filename" id="editUploadFilename"></span>
                                <input type="hidden" name="edit_foto_base64" id="editFotoBase64" class="upload-base64-input">
                            </div>
                        </div>
                        <div class="coluna coluna2">
                            <div class="campo campo-select custom-select-container" id="campoEditCategoria">
                                <label>Categoria</label>
                                <div class="select-btn">
                                    <span class="select-btn-text" id="editItemCategoriaTexto">Selecione uma categoria...</span>
                                    <i class="fa-solid fa-angle-down select-icon"></i>
                                </div>
                                <div class="select-dropdown">
                                    <div class="option" data-value="">Selecione uma categoria...</div>
                                    <div class="option" data-value="Acessórios">Acessórios</div>
                                    <div class="option" data-value="Bolsas">Bolsas</div>
                                    <div class="option" data-value="Chaves">Chaves</div>
                                    <div class="option" data-value="Documentos">Documentos</div>
                                    <div class="option" data-value="Eletrônicos">Eletrônicos</div>
                                    <div class="option" data-value="Roupas">Roupas</div>
                                    <div class="option" data-value="Utensílios">Utensílios</div>
                                    <div class="option" data-value="Outros">Outros</div>
                                </div>
                                <input type="hidden" name="categoria" id="editItemCategoria" class="input-oculto" required>
                            </div>
                            <div class="campo campo-textarea">
                                <label for="editItemDescricao">Descrição</label>
                                <textarea class="campo-textarea" name="descricao" id="editItemDescricao" placeholder="Descreva o item" maxlength="400" required></textarea>
                                <span class="contador-caracteres" id="editContadorCaracteres">0/400</span>
                            </div>
                        </div>
                        <div class="coluna coluna3">
                            <div class="campo campo-select custom-select-container" id="campoEditCor">
                                <label>Cor principal</label>
                                <div class="select-btn">
                                    <span class="select-btn-text" id="editItemCorTexto">Selecione uma cor...</span>
                                    <i class="fa-solid fa-angle-down select-icon"></i>
                                </div>
                                <div class="select-dropdown">
                                    <div class="option" data-value="">Selecione uma cor...</div>
                                    <div class="option" data-value="Branco" data-classe="branco"><div class="space-color branco"></div>Branco</div>
                                    <div class="option" data-value="Cinza" data-classe="cinza"><div class="space-color cinza"></div>Cinza</div>
                                    <div class="option" data-value="Rosa" data-classe="rosa"><div class="space-color rosa"></div>Rosa</div>
                                    <div class="option" data-value="Amarelo" data-classe="amarelo"><div class="space-color amarelo"></div>Amarelo</div>
                                    <div class="option" data-value="Laranja" data-classe="laranja"><div class="space-color laranja"></div>Laranja</div>
                                    <div class="option" data-value="Vermelho" data-classe="vermelho"><div class="space-color vermelho"></div>Vermelho</div>
                                    <div class="option" data-value="Verde" data-classe="verde"><div class="space-color verde"></div>Verde</div>
                                    <div class="option" data-value="Azul" data-classe="azul"><div class="space-color azul"></div>Azul</div>
                                    <div class="option" data-value="Roxo" data-classe="roxo"><div class="space-color roxo"></div>Roxo</div>
                                    <div class="option" data-value="Marrom" data-classe="marrom"><div class="space-color marrom"></div>Marrom</div>
                                    <div class="option" data-value="Preto" data-classe="preto"><div class="space-color preto"></div>Preto</div>
                                    <div class="option" data-value="Outros" data-classe="outros">Outros</div>
                                </div>
                                <input type="hidden" name="cor" id="editItemCor" class="input-oculto" required>
                            </div>
                            <div class="campo campo-marca">
                                <label for="editItemMarca">Marca</label>
                                <input type="text" id="editItemMarca" name="marca" placeholder="Digite a marca (opcional)">
                            </div>
                            <div class="campo campo-data">
                                <label for="editItemData">Data</label>
                                <div class="input-icone-wrapper">
                                    <input type="text" name="data" id="editItemData" placeholder="dd/mm/aaaa" autocomplete="off" required>
                                    <i class="fa-regular fa-calendar"></i>
                                </div>
                            </div>
                            <div class="campo">
                                <label for="editItemLocal">Local</label>
                                <input type="text" id="editItemLocal" name="local" placeholder="Informe onde foi encontrado" required>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-acoes">
                    <button type="button" class="btn-cancelar" id="btnCancelarEditar">Cancelar</button>
                    <button type="button" class="btn-confirmar btn-editar-concluir" id="btnConcluirEditar">Salvar Alterações</button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-editar-item")) customElements.define("modal-editar-item", ModalEditarItemComponent);

class ModalExcluirItemComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id="modalExcluir" class="modal-overlay modal-excluir">
            <div class="modal-container">
                <button type="button" class="modal-btn-fechar" id="modalExcluirFechar" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-header">
                    <div class="tipo-modal"><i class="fa-solid fa-trash"></i><span><h3>Excluir Item</h3><p>Tem certeza que deseja excluir esse item?</p></span></div>
                </div>
                <div class="modal-corpo">
                    <div class="resgate-card-preview">
                        <div class="resgate-foto-wrapper"><img id="excluirItemFoto" src="" alt="Foto do item"></div>
                        <div class="resgate-dados-wrapper">
                            <p class="resgate-descricao-texto"><span id="excluirItemDescricao"></span></p>
                            <div class="area-atributos">
                                <div class="resgate-categoria-badge"><i class="fa-solid fa-box"></i><span id="excluirItemCategoria"></span></div>
                                <div class="modal-status-badge"><span id="excluirItemStatus"></span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-acoes">
                    <button type="button" class="btn-cancelar" id="btnCancelarExcluir">Cancelar</button>
                    <button type="button" class="btn-confirmar btn-excluir-concluir" id="btnConcluirExcluir">Excluir Item</button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-excluir-item")) customElements.define("modal-excluir-item", ModalExcluirItemComponent);

class ModalRetirarSolititacaoComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id="modalCancelarSolicitacao" class="modal-overlay modal-remover-solicitacao">
            <div class="modal-container">
                <button type="button" class="modal-btn-fechar" id="modalCancelarSolicitacaoFechar" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-header">
                    <div class="tipo-modal"><i class="fa-solid fa-ban"></i><span><h3>Remover Solicitação</h3><p>Tem certeza que deseja remover a solicitação de resgate desse item?</p></span></div>
                </div>
                <div class="modal-corpo">
                    <div class="resgate-card-preview">
                        <div class="resgate-foto-wrapper"><img id="cancelarSolItemFoto" src="" alt="Foto do item"></div>
                        <div class="resgate-dados-wrapper">
                            <p class="resgate-descricao-texto"><span id="cancelarSolItemDescricao"></span></p>
                            <div class="area-atributos">
                                <div class="resgate-categoria-badge"><i class="fa-solid fa-box"></i><span id="cancelarSolItemCategoria"></span></div>
                                <div class="modal-status-badge"><span id="cancelarSolItemStatus"></span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-acoes">
                    <button type="button" class="btn-cancelar" id="btnCancelarAcaoSolicitacao">Voltar</button>
                    <button type="button" class="btn-confirmar btn-remover-solicitacao" id="btnConcluirCancelarSolicitacao">Remover Solicitação</button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-retirar-solicitacao")) customElements.define("modal-retirar-solicitacao", ModalRetirarSolititacaoComponent);


class ModalComprovanteResgateComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id="modalComprovanteResgate" class="modal-overlay modal-comprovante">
            <div class="modal-container">
                <button type="button" class="modal-btn-fechar" id="modalComprovanteFechar" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-header">
                    <div class="tipo-modal"><i class="fa-solid fa-receipt"></i><span><h3>Comprovante de Resgate</h3><p>Confira as orientações para realizar a devolução.</p></span></div>
                </div>
                <div class="modal-corpo">
                    <div class="area-solicitado">
                        <div class="topico"><i class="fa-solid fa-box-archive"></i><h6>Item solicitado</h6></div>
                        <div class="resgate-card-preview item">
                            <div class="resgate-foto-wrapper"><img id="comprovanteFoto" src="" alt="Foto do item"></div>
                            <div class="resgate-dados-wrapper">
                                <p class="resgate-descricao-texto" id="comprovanteDescricao"></p>
                                <div class="area-atributos">
                                    <div class="resgate-categoria-badge"><i class="fa-solid fa-box"></i><span id="comprovanteCategoria"></span></div>
                                    <div class="modal-status-badge"><span id="comprovanteStatus"></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-preview retirar">
                        <div class="topico"><i class="fa-solid fa-location-dot"></i><h6>Onde retirar</h6></div>
                        <div class="wrapper">
                            <div class="box"><i class="fa-regular fa-building"></i><strong>Local e horário</strong><p>Combine a retirada com a administração pelos canais oficiais.</p></div>
                            <div class="box"><i class="fa-regular fa-calendar-days"></i><strong>Data disponível</strong><p>A administração informará a data após aprovar o pedido.</p></div>
                            <div class="box"><i class="fa-regular fa-clock"></i><strong>Confirmação</strong><p>Confirme somente depois de receber e conferir o item.</p></div>
                        </div>
                    </div>
                    <div class="card-preview levar">
                        <div class="topico"><i class="fa-solid fa-file"></i><h6>O que levar</h6></div>
                        <div class="wrapper">
                            <div class="box">
                                <p>No momento da retirada, tenha em mãos:
                                <ul>
                                    <li><i class="fa-solid fa-check"></i>Documento de identidade;</li>
                                    <li><i class="fa-solid fa-check"></i>RGM ou matrícula (se for estudante);</li>
                                    <li><i class="fa-solid fa-check"></i>Comprovante da solicitação aprovada.</li>
                                </ul>
                            </div>
                            <div class="atencao"><span><i class="fa-solid fa-circle-exclamation"></i><strong>Atenção!</strong></span><p>A retirada só poderá ser realizada pelo solicitante.</p></div>
                        </div>
                    </div>
                    <div class="card-preview cuidados">
                        <div class="topico"><i class="fa-solid fa-shield-halved"></i><h6>Cuidados na devolução</h6></div>
                        <div class="wrapper">
                            <div class="box"><i class="fa-solid fa-circle-check"></i><p>Antes de retirar o item, confira se ele corresponde ao objeto solicitado.</p></div>
                            <div class="box"><i class="fa-solid fa-circle-check"></i><p>Após receber o item, acesse o sistema e confirme a retirada para finalizar o processo.</p></div>
                        </div>
                    </div>
                </div>
                <div class="modal-acoes">
                    <button type="button" class="btn-cancelar" id="btnSairComprovante">Sair</button>
                    <button type="button" class="btn-confirmar" id="btnConfirmarRetiradaComprovante">Confirmar Retirada</button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-comprovante-resgate")) customElements.define("modal-comprovante-resgate", ModalComprovanteResgateComponent);


class ModalSenhaRetiradaComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id="modalSenhaRetirada" class="modal-overlay modal-senha-resgate">
            <div class="modal-container">
                <button type="button" class="modal-btn-fechar" id="modalSenhaRetiradaFechar" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-header">
                    <div class="tipo-modal">
                        <i class="fa-solid fa-lock"></i>
                        <span><h3>Confirmar Retirada</h3><p>Digite sua senha para confirmar a retirada do item.</p></span>
                    </div>
                </div>
                <div class="modal-corpo">
                    <div class="campo"">
                        <label for="inputSenhaRetirada">Digite sua senha para confirmar</label>
                        <div class="campo-input-wrap">
                            <input type="password" id="inputSenhaRetirada" placeholder="Digite sua senha">
                            <button type="button" class="alt-senha-retirada">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-acoes">
                    <button type="button" class="btn-cancelar" id="btnCancelarSenhaRetirada">Voltar</button>
                    <button type="button" class="btn-confirmar" id="btnConcluirSenhaRetirada">Confirmar</button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-senha-retirada")) customElements.define("modal-senha-retirada", ModalSenhaRetiradaComponent);



class ModalRecorteComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="cropper-modal modal-recorte" style="display:none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Ajustar Recorte</h3>
                    <button type="button" class="btn-close-modal"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">
                    <img class="image-to-crop" src="" alt="Cortar imagem"/>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-modal-cancel">Cancelar</button>
                    <button type="button" class="btn-modal-confirm">Recortar e Salvar</button>
                </div>
            </div>
        </div>
        `;
    }
}
if (!customElements.get("modal-recorte-foto")) customElements.define("modal-recorte-foto", ModalRecorteComponent);



/* ==========================================================
   GERENCIADOR GERAL DE MODAIS
   ========================================================== */
const GerenciadorModais = (() => {
    let callbacks = {};
    let itemAtual = null;
    let corClasseEdit = '';
    let timerClamp = null;

    const formatacaoStatus = {
        aprovado:   { rotulo: "Aprovado",    classe: "aprovado",   icone: "fa-solid fa-check" },
        reprovado:  { rotulo: "Reprovado",   classe: "reprovado",  icone: "fa-solid fa-xmark" },
        analise:    { rotulo: "Em análise",  classe: "analise",    icone: "fa-solid fa-hourglass"},
        devolvido:  { rotulo: "Devolvido",   classe: "devolvido",  icone: "fa-solid fa-arrow-rotate-left" },
        resgatado:  { rotulo: "Resgatado",   classe: "resgatado",  icone: "fa-solid fa-location-crosshairs" },
        solicitado: { rotulo: "Solicitado",  classe: "solicitado", icone: "fa-solid fa-hand" },
        
        perdido:    { rotulo: "Perdido",     classe: "perdido",    icone: "fa-solid fa-magnifying-glass" },
        achado:     { rotulo: "Achado",      classe: "achado",     icone: "fa-solid fa-check-double" }
    };

    function renderizarStatus(el, statusValor) {
        if (!el) return;
        const conf = formatacaoStatus[statusValor] || {
            rotulo: statusValor || 'Indefinido',
            classe: statusValor || 'indefinido',
            icone: 'fa-solid fa-circle-question'
        };
        el.className = `status-tag ${conf.classe}`;
        el.innerHTML = `<i class="${conf.icone}"></i> ${conf.rotulo}`;
    }

    function fecharModal(modal) {
        if (modal) modal.classList.remove('ativo');
    }

    function fecharTodos() {
        document.querySelectorAll('.modal-detalhes, .modal-resgate, .modal-overlay').forEach(fecharModal);
        itemAtual = null;
    }

    function abrirDetalhes(item, isMeusItens = false) {
        const modal = document.getElementById('modalDetalhes');
        if (!modal || !item) return;
        itemAtual = item;

        modal.setAttribute('data-id', item.id);
        const modalImg = document.getElementById('modalImg');
        const modalDesc = document.getElementById('modalDescricao');
        const btnToggle = document.getElementById('modalBtnToggle');
        const avisoSol = document.getElementById('modalAvisoSolicitacao');

        const btnResgatar = document.getElementById('btnAcaoDetalhesResgatar');
        const btnContestar = document.getElementById('btnAcaoDetalhesContestar');

        if (modalImg) modalImg.src = item.foto || '';
        if (modalDesc) modalDesc.textContent = item.descricao || '';
        document.getElementById('modalCategoria')?.replaceChildren(document.createTextNode(item.categoria || ''));
        document.getElementById('modalLocal')?.replaceChildren(document.createTextNode(item.local || ''));
        document.getElementById('modalData')?.replaceChildren(document.createTextNode(item.data || ''));
        document.getElementById('modalCorTexto')?.replaceChildren(document.createTextNode(item.corNome || ''));

        const corVisual = document.getElementById('modalCorVisual');
        if (corVisual) corVisual.className = `space-color ${item.corClasse || ''}`;

        const marcaEl = document.getElementById('modalMarca');
        if (marcaEl) marcaEl.textContent = (item.marca && item.marca.trim() !== '') ? item.marca.trim() : 'Desconhecida';

        let statusChave = item.status;
        if (!isMeusItens) {
            statusChave = item.usuarioSolicitou
                ? 'solicitado'
                : (item.status === 'aprovado') ? 'perdido' : 'achado';
        }
        renderizarStatus(document.getElementById('modalStatus'), statusChave);

        // Lógica dos Alertas no Modal de Detalhes para "Meus Itens"
        if (avisoSol) {
            if (isMeusItens && item.status === 'solicitado' && item.estadoSolicitacao) {
                let msg = '';
                let classeAviso = '';
                let btnHTML = '';

                if (item.estadoSolicitacao === 'pendente') {
                    msg = '<div class="desc-aviso"><i class="fa-solid fa-clock-rotate-left"></i> <strong>Solicitação pendente:</strong></div> <p>Aguarde o retorno da administração.</p>';
                    classeAviso = 'aviso-analise';
                } else if (item.estadoSolicitacao === 'reprovado') {
                    msg = '<div class="desc-aviso"><i class="fa-solid fa-circle-exclamation"></i> <strong>Solicitação reprovada:</strong></div> <p>Não possui as informações corretas para o resgate.</p>';
                    classeAviso = 'aviso-reprovado';
                } else if (item.estadoSolicitacao === 'aprovado') {
                    msg = '<div class="desc-aviso"><i class="fa-solid fa-circle-check"></i> <strong>Solicitação aprovada:</strong></div> <p>Verifique os detalhes para realizar o resgate.</p>';
                    classeAviso = 'aviso-aprovado';
                    btnHTML = `<button type="button" class="btn-comprovante-detalhes"><i class="fi fi-br-receipt"></i> <span>Ver Comprovante</span></button>`;
                }

                avisoSol.className = `modal-aviso-solicitacao ${classeAviso}`;
                avisoSol.style.display = 'block';
                avisoSol.innerHTML = `<div>${msg}</div> ${btnHTML}`;

                const btnComp = avisoSol.querySelector('.btn-comprovante-detalhes');
                if (btnComp) {
                    btnComp.onclick = () => {
                        fecharModal(modal);
                        abrirComprovante(item);
                    };
                }
            } else if (!isMeusItens && item.usuarioSolicitou) {
                avisoSol.className = 'modal-aviso-solicitacao aviso-analise';
                avisoSol.style.display = 'block';
                avisoSol.textContent = item.estadoSolicitacao === 'aprovado'
                    ? 'Seu pedido foi aprovado. Veja o comprovante na área Meus itens.'
                    : 'Seu pedido de resgate está aguardando análise.';
            } else {
                avisoSol.className = 'modal-aviso-solicitacao';
                avisoSol.style.display = 'none';
                avisoSol.innerHTML = '';
            }
        }

        if (btnResgatar) btnResgatar.style.display = 'none';
        if (btnContestar) btnContestar.style.display = 'none';

        if (!isMeusItens && window.PerdidexUser?.role !== 'admin') {
            if (item.status === 'aprovado' && btnResgatar) {
                btnResgatar.style.display = 'inline-flex';
                btnResgatar.disabled = false;
                btnResgatar.title = 'Solicitar resgate deste item';
                btnResgatar.querySelector('span').textContent = 'Resgatar';
            } else if (item.status === 'devolvido' && btnContestar) {
                btnContestar.style.display = 'inline-flex';
                btnContestar.disabled = false;
                btnContestar.title = 'Contestar a propriedade deste item';
                btnContestar.querySelector('span').textContent = 'Contestar';
            }
        }

        clearTimeout(timerClamp);
        if (modalDesc) {
            modalDesc.classList.remove('expandido');
            modalDesc.classList.add('com-clamp');
        }
        if (btnToggle) {
            btnToggle.classList.remove('aberto');
            btnToggle.textContent = 'Ler mais';
        }

        modal.classList.add('ativo');

        requestAnimationFrame(() => {
            if (modalDesc && btnToggle) {
                btnToggle.style.display = modalDesc.scrollHeight > 38 ? 'inline-flex' : 'none';
            }
        });
    }

    function abrirResgate(item) {
        const modal = document.getElementById('modalResgate');
        if (!modal || !item) return;
        itemAtual = item;
        fecharModal(document.getElementById('modalDetalhes'));

        const img = document.getElementById('resgateImg');
        const desc = document.getElementById('resgateDescricao');
        const cat = document.getElementById('resgateCategoriaTexto');

        if (img) { img.src = item.foto || ''; img.alt = item.categoria || ''; }
        if (desc) desc.textContent = item.descricao || '';
        if (cat) cat.textContent = item.categoria || '';
        renderizarStatus(document.getElementById('resgateStatus'), 'perdido');

        modal.classList.add('ativo');
    }

    function abrirContestar(item) {
        const modal = document.getElementById('modalContestar');
        if (!modal || !item) return;
        itemAtual = item;
        fecharModal(document.getElementById('modalDetalhes'));

        const img = document.getElementById('contestarImg');
        const desc = document.getElementById('contestarDescricao');
        const cat = document.getElementById('contestarCategoriaTexto');

        if (img) { img.src = item.foto || ''; img.alt = item.categoria || ''; }
        if (desc) desc.textContent = item.descricao || '';
        if (cat) cat.textContent = item.categoria || '';
        const description = document.getElementById('contestacaoDescricao');
        const evidenceInput = document.getElementById('contestacaoEvidencias');
        if (description) description.value = '';
        if (evidenceInput) evidenceInput.value = '';

        renderizarStatus(document.getElementById('contestarStatus'), 'achado');

        modal.classList.add('ativo');
    }

    function abrirEditar(item) {
        const modal = document.getElementById('modalEditar');
        if (!modal || !item) return;
        itemAtual = item;

        const editImg = document.getElementById('editItemFoto');
        const editBase64 = document.getElementById('editFotoBase64');
        const editFilename = document.getElementById('editUploadFilename');

        if (editImg) editImg.src = item.foto || '';
        if (editBase64) editBase64.value = '';
        if (editFilename) editFilename.textContent = '';

        renderizarStatus(document.getElementById('editItemStatus'), item.status);

        const inputCat = document.getElementById('editItemCategoria');
        const labelCat = document.getElementById('editItemCategoriaTexto');
        if (inputCat) inputCat.value = item.categoria || '';
        if (labelCat) labelCat.textContent = item.categoria || 'Selecione uma categoria...';

        const desc = document.getElementById('editItemDescricao');
        const count = document.getElementById('editContadorCaracteres');
        if (desc) {
            desc.value = item.descricao || '';
            if (count) count.textContent = `${desc.value.length}/400`;
        }

        const inputCor = document.getElementById('editItemCor');
        const labelCor = document.getElementById('editItemCorTexto');
        
        if (inputCor) inputCor.value = item.corNome || '';
        if (labelCor) {
            labelCor.innerHTML = item.corNome 
                ? `<div class="space-color ${item.corClasse}"></div>${item.corNome}` 
                : 'Selecione uma cor...';
        }

        const inputMarca = document.getElementById('editItemMarca');
        if (inputMarca) inputMarca.value = (item.marca && item.marca.trim() !== 'Desconhecida') ? item.marca : '';

        const inputData = document.getElementById('editItemData');
        if (inputData) {
            inputData.value = item.data || '';
            if (inputData._flatpickr) inputData._flatpickr.setDate(item.data || '', false, "d/m/Y");
        }

        const inputLocal = document.getElementById('editItemLocal');
        if (inputLocal) inputLocal.value = item.local || '';

        modal.classList.add('ativo');

        if (typeof GerenciadorFoto !== 'undefined') {
            const container = modal.querySelector('.upload-container');
            if (container) GerenciadorFoto.vincularContainerUpload(container);
        }
    }

    function preencherPreviewSimples(prefixo, item) {
        renderizarStatus(document.getElementById(`${prefixo}Status`), item.status);
        const img = document.getElementById(`${prefixo}Foto`);
        if (img) img.src = item.foto || '';
        const cat = document.getElementById(`${prefixo}Categoria`);
        if (cat) cat.textContent = item.categoria || '';
        const desc = document.getElementById(`${prefixo}Descricao`);
        if (desc) desc.textContent = item.descricao || '';
    }

    function abrirExcluir(item) {
        const modal = document.getElementById('modalExcluir');
        if (!modal || !item) return;
        itemAtual = item;
        preencherPreviewSimples('excluirItem', item);
        modal.classList.add('ativo');
    }

    function abrirCancelarSolicitacao(item) {
        const modal = document.getElementById('modalCancelarSolicitacao');
        if (!modal || !item) return;
        itemAtual = item;
        preencherPreviewSimples('cancelarSolItem', item);
        modal.classList.add('ativo');
    }

    function abrirComprovante(item) {
        const modal = document.getElementById('modalComprovanteResgate');
        if (!modal || !item) return;
        itemAtual = item;

        const img = document.getElementById('comprovanteFoto');
        const desc = document.getElementById('comprovanteDescricao');
        const cat = document.getElementById('comprovanteCategoria');
        const statusEl = document.getElementById('comprovanteStatus');
        const btnConfirmar = document.getElementById('btnConfirmarRetiradaComprovante');

        if (img) img.src = item.foto || '';
        if (desc) desc.textContent = item.descricao || '';
        if (cat) cat.textContent = item.categoria || '';
        renderizarStatus(statusEl, item.status);

        if (btnConfirmar) {
            if (item.status === 'resgatado') {
                btnConfirmar.textContent = "Item já resgatado";
                btnConfirmar.disabled = true;
                btnConfirmar.style.opacity = "0.6";
                btnConfirmar.style.cursor = "not-allowed";
            } else {
                btnConfirmar.textContent = "Confirmar Retirada";
                btnConfirmar.disabled = false;
                btnConfirmar.style.opacity = "1";
                btnConfirmar.style.cursor = "pointer";
            }
        }

        modal.classList.add('ativo');
    }

    function abrirSenhaRetirada(item) {
        const modal = document.getElementById('modalSenhaRetirada');
        if (!modal || !item) return;
        itemAtual = item;
        
        const inputSenha = document.getElementById('inputSenhaRetirada');
        if (inputSenha) inputSenha.value = '';

        modal.classList.add('ativo');
    }

    function init(opcoes = {}) {
        callbacks = opcoes;

        const mapaBotoesFechar = [
            { btn: '#modalFechar', modal: '#modalDetalhes' },
            { btn: '#modalResgateFechar', modal: '#modalResgate' },
            { btn: '#btnCancelarResgate', modal: '#modalResgate' },
            { btn: '#modalContestarFechar', modal: '#modalContestar' },
            { btn: '#btnCancelarContestar', modal: '#modalContestar' },
            { btn: '#modalEditarFechar', modal: '#modalEditar' },
            { btn: '#btnCancelarEditar', modal: '#modalEditar' },
            { btn: '#modalExcluirFechar', modal: '#modalExcluir' },
            { btn: '#btnCancelarExcluir', modal: '#modalExcluir' },
            { btn: '#modalCancelarSolicitacaoFechar', modal: '#modalCancelarSolicitacao' },
            { btn: '#btnCancelarAcaoSolicitacao', modal: '#modalCancelarSolicitacao' },
            { btn: '#modalComprovanteFechar', modal: '#modalComprovanteResgate' },
            { btn: '#btnSairComprovante', modal: '#modalComprovanteResgate' },
            { btn: '#modalSenhaRetiradaFechar', modal: '#modalSenhaRetirada' },
            { btn: '#btnCancelarSenhaRetirada', modal: '#modalSenhaRetirada' }
        ];

        mapaBotoesFechar.forEach(({ btn, modal }) => {
            document.querySelector(btn)?.addEventListener('click', () => {
                const modalEl = document.querySelector(modal);
                fecharModal(modalEl);
                
                if (modal === '#modalSenhaRetirada' && btn === '#btnCancelarSenhaRetirada') {
                    if (itemAtual) abrirComprovante(itemAtual);
                } else {
                    itemAtual = null;
                }
            });
        });

        document.querySelectorAll('.modal-detalhes, .modal-resgate, .modal-editar, .modal-excluir, .modal-overlay').forEach(modal => {
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) {
                    fecharModal(modal);
                    itemAtual = null;
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') fecharTodos();
        });

        const modalDesc = document.getElementById('modalDescricao');
        const modalBtnToggle = document.getElementById('modalBtnToggle');
        modalBtnToggle?.addEventListener('click', () => {
            const expandido = modalDesc.classList.toggle('expandido');
            modalBtnToggle.classList.toggle('aberto', expandido);
            modalBtnToggle.textContent = expandido ? 'Ler menos' : 'Ler mais';

            if (expandido) {
                modalDesc.classList.remove('com-clamp');
            } else {
                clearTimeout(timerClamp);
                timerClamp = setTimeout(() => modalDesc.classList.add('com-clamp'), 350);
            }
        });

        document.querySelector('.btn-resgatar-vermelho')?.addEventListener('click', () => {
            if (itemAtual) abrirResgate(itemAtual);
        });

        document.getElementById('btnAcaoDetalhesContestar')?.addEventListener('click', () => {
            if (itemAtual) abrirContestar(itemAtual);
        });

        document.getElementById('btnConfirmarResgate')?.addEventListener('click', async () => {
            try {
                if (!itemAtual || !callbacks.onConfirmarResgate) throw new Error('Ação indisponível.');
                await callbacks.onConfirmarResgate(itemAtual);
                fecharModal(document.getElementById('modalResgate'));
                itemAtual = null;
                GerenciadorToast.exibir("Solicitação de resgate enviada com sucesso!");
            } catch (error) {
                GerenciadorToast.exibir(`Não foi possível solicitar o resgate: ${error.message}`, 4500, true);
            }
        });

        document.getElementById('btnConfirmarContestar')?.addEventListener('click', async () => {
            try {
                if (!itemAtual || !callbacks.onConfirmarContestacao) throw new Error('Ação indisponível.');
                const description = document.getElementById('contestacaoDescricao')?.value || '';
                const evidenceInput = document.getElementById('contestacaoEvidencias');
                const files = Array.from(evidenceInput?.files || []);
                if (description.trim().length < 20) {
                    throw new Error('A descrição deve ter pelo menos 20 caracteres.');
                }
                if (files.length > 3) {
                    throw new Error('Envie no máximo 3 imagens como evidência.');
                }
                if (files.some((file) => file.size > 10 * 1024 * 1024)) {
                    throw new Error('Cada evidência deve ter no máximo 10 MB.');
                }
                await callbacks.onConfirmarContestacao(itemAtual, { description, files });
                fecharModal(document.getElementById('modalContestar'));
                itemAtual = null;
                GerenciadorToast.exibir("Contestação enviada. Acompanhe o resultado em Minhas contestações.");
            } catch (error) {
                GerenciadorToast.exibir(`Não foi possível enviar a contestação: ${error.message}`, 4500, true);
            }
        });

        document.getElementById('btnConcluirExcluir')?.addEventListener('click', async () => {
            try {
                if (!itemAtual || !callbacks.onConfirmarExcluir) throw new Error('Ação indisponível.');
                await callbacks.onConfirmarExcluir(itemAtual);
                fecharModal(document.getElementById('modalExcluir'));
                itemAtual = null;
                GerenciadorToast.exibir("O item foi desativado e removido das listagens.");
            } catch (error) {
                GerenciadorToast.exibir(`Não foi possível desativar o item: ${error.message}`, 4500, true);
            }
        });

        document.getElementById('btnConcluirCancelarSolicitacao')?.addEventListener('click', async () => {
            try {
                if (!itemAtual || !callbacks.onConfirmarCancelarSolicitacao) throw new Error('Ação indisponível.');
                await callbacks.onConfirmarCancelarSolicitacao(itemAtual);
                fecharModal(document.getElementById('modalCancelarSolicitacao'));
                itemAtual = null;
                GerenciadorToast.exibir("Sua solicitação de resgate foi cancelada!");
            } catch (error) {
                GerenciadorToast.exibir(`Não foi possível cancelar a solicitação: ${error.message}`, 4500, true);
            }
        });

        document.getElementById('btnConfirmarRetiradaComprovante')?.addEventListener('click', () => {
            if (itemAtual && itemAtual.status === 'solicitado') {
                fecharModal(document.getElementById('modalComprovanteResgate'));
                abrirSenhaRetirada(itemAtual);
            }
        });

        // ==========================================
        // LÓGICA DO MODAL DE SENHA (CORRIGIDA E DIRETA)
        // ==========================================
        document.addEventListener('click', async (e) => {
            const btnConcluir = e.target.closest('#btnConcluirSenhaRetirada');
            if (btnConcluir) {
                try {
                    if (!itemAtual || !callbacks.onConfirmarRetirada) throw new Error('Ação indisponível.');
                    const inputSenha = document.getElementById('inputSenhaRetirada');
                    const password = inputSenha?.value || '';
                    if (!password) throw new Error('Digite sua senha para confirmar.');
                    await callbacks.onConfirmarRetirada(itemAtual, password);
                    if (inputSenha) inputSenha.value = '';
                    GerenciadorToast.exibir("A retirada do item foi confirmada. Obrigado!");
                    fecharModal(document.getElementById('modalSenhaRetirada'));
                    itemAtual = null;
                } catch (error) {
                    GerenciadorToast.exibir(`Não foi possível confirmar a retirada: ${error.message}`, 4500, true);
                }
            }
        });

        document.querySelector('.alt-senha-retirada')?.addEventListener('click', function() {
            const input = document.getElementById('inputSenhaRetirada');
            const icone = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icone.className = 'fa-regular fa-eye-slash';
            } else {
                input.type = 'password';
                icone.className = 'fa-regular fa-eye';
            }
        });

        // ==========================================
        // LÓGICA DO MODAL DE EDITAR (MANTIDA)
        // ==========================================
        document.getElementById('btnConcluirEditar')?.addEventListener('click', async () => {
            if (itemAtual) {
                const fotoBase64 = document.getElementById('editFotoBase64')?.value;
                const fotoPreview = document.getElementById('editItemFoto')?.src;
                
                const btnTextoCor = document.getElementById('editItemCorTexto')?.textContent.trim();
                const corInputHidden = document.getElementById('editItemCor')?.value;
                
                const corNomeFinal = btnTextoCor && btnTextoCor !== "Selecione uma cor..." ? btnTextoCor : (corInputHidden || itemAtual.corNome);
                const corClasseFinal = corNomeFinal.toLowerCase();

                const dadosAtualizados = {
                    foto: fotoBase64 || fotoPreview || itemAtual.foto,
                    categoria: document.getElementById('editItemCategoria')?.value || itemAtual.categoria,
                    descricao: document.getElementById('editItemDescricao')?.value || itemAtual.descricao,
                    marca: document.getElementById('editItemMarca')?.value?.trim() || '',
                    data: document.getElementById('editItemData')?.value || itemAtual.data,
                    local: document.getElementById('editItemLocal')?.value || itemAtual.local,
                    corNome: corNomeFinal,
                    corClasse: corClasseFinal
                };

                try {
                    if (!callbacks.onConfirmarEditar) throw new Error('Ação indisponível.');
                    await callbacks.onConfirmarEditar(itemAtual, dadosAtualizados);
                    GerenciadorToast.exibir("As informações do item foram editadas com sucesso!");
                } catch (error) {
                    GerenciadorToast.exibir(`Não foi possível editar o item: ${error.message}`, 4500, true);
                    return;
                }
            }
            fecharModal(document.getElementById('modalEditar'));
            itemAtual = null;
        });
    }

    return {
        init, formatacaoStatus, renderizarStatus, fecharTodos,
        abrirDetalhes, abrirResgate, abrirContestar, abrirEditar, abrirExcluir, abrirCancelarSolicitacao, abrirComprovante, abrirSenhaRetirada
    };
})();

window.GerenciadorModais = GerenciadorModais;