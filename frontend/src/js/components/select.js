/* ==========================================================
   MÓDULO GENÉRICO DE SELECTS CUSTOMIZADOS (CUSTOM SELECTS)
   ========================================================== */

const GerenciadorSelect = (() => {
    /* Inicializa um seletor customizado genérico */
    function configurar(containerIdOuEl, opcoesConfig = {}) {
        const container = typeof containerIdOuEl === 'string'
            ? document.getElementById(containerIdOuEl)
            : containerIdOuEl;

        if (!container) return;

        const selectBtn = container.querySelector('.select-btn');
        const dropdown = container.querySelector('.select-dropdown');
        const labelTexto = container.querySelector('.select-btn-text') || container.querySelector('.btn-texto') || container.querySelector('span:first-child');
        const inputOculto = container.querySelector('.input-oculto') || container.querySelector('input[type="hidden"]');

        // Abre / Fecha o menu
        selectBtn?.addEventListener('click', (e) => {
            e.stopPropagation();

            // Fecha outros selects abertos
            document.querySelectorAll('.custom-select-container, .custom-select').forEach(outro => {
                if (outro !== container) {
                    outro.querySelector('.select-dropdown')?.classList.remove('mostrar');
                    outro.querySelector('.select-btn')?.classList.remove('ativo');
                }
            });

            dropdown?.classList.toggle('mostrar');
            selectBtn.classList.toggle('ativo');
            selectBtn.style.borderColor = "";
        });

        dropdown?.addEventListener('click', (e) => {
            const opt = e.target.closest('.option');
            if (!opt || !dropdown.contains(opt)) return;
            e.stopPropagation();
            const valor = opt.getAttribute('data-value') || '';
            const conteudoHtml = opt.innerHTML.trim();

            if (inputOculto) inputOculto.value = valor;
            if (labelTexto) labelTexto.innerHTML = conteudoHtml;

            if (valor === '') {
                selectBtn?.classList.remove('tem-valor');
                if (labelTexto) labelTexto.style.color = "#8b8b8b";
            } else {
                selectBtn?.classList.add('tem-valor');
                if (labelTexto) labelTexto.style.color = "#3b383e";
                selectBtn.style.borderColor = "";
            }

            dropdown.classList.remove('mostrar');
            selectBtn?.classList.remove('ativo');
            if (opcoesConfig.onSelect) opcoesConfig.onSelect(valor, opt);
        });

        // Validação de formulário associado
        if (opcoesConfig.validarObrigatorio) {
            const form = container.closest('form');
            form?.addEventListener('submit', (e) => {
                if (!inputOculto || inputOculto.value.trim() === '') {
                    e.preventDefault();
                    if (selectBtn) selectBtn.style.borderColor = "#cd1b31";
                    if (opcoesConfig.mensagemErro) {
                        alert(opcoesConfig.mensagemErro);
                    }
                }
            });
        }
    }

    /* Inicializa selects gerais automáticos da página */
    function init() {
        document.querySelectorAll('.custom-select-container').forEach(c => configurar(c));

        // Fecha menus ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-container') && !e.target.closest('.custom-select')) {
                document.querySelectorAll('.select-dropdown').forEach(d => d.classList.remove('mostrar'));
                document.querySelectorAll('.select-btn').forEach(b => b.classList.remove('ativo'));
            }
        });

        // Configuração específica da página de perfil/estudante (se existir na página)
        const perfilSelect = document.getElementById('perfilSelect');
        const rgmContainer = document.getElementById('rgm-container');
        const rgmInput = document.getElementById('rgm-input');

        if (perfilSelect) {
            configurar(perfilSelect, {
                validarObrigatorio: true,
                mensagemErro: "Por favor, selecione um perfil.",
                onSelect: (valor, opcao) => {
                    if (!rgmContainer || !rgmInput) return;

                    if (opcao?.dataset.profileName === "student") {
                        rgmContainer.style.display = "flex";
                        rgmInput.required = true;
                    } else {
                        rgmContainer.style.display = "none";
                        rgmInput.required = false;
                        rgmInput.value = "";
                    }
                }
            });
        }
    }

    return {
        init,
        configurar
    };
})();

window.GerenciadorSelect = GerenciadorSelect;

document.addEventListener("DOMContentLoaded", () => {
    GerenciadorSelect.init();
});