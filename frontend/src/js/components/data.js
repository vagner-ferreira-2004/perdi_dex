/* ==========================================================
   MÓDULO DE GESTÃO E FORMATAÇÃO DE DATAS (FLATPICKR)
   ========================================================== */

const GerenciadorDatas = (() => {
    const mesesNomes = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    /* 1. Conversões de data (DD/MM/AAAA) para Timestamp */
    function converterData(textoData) {
        if (!textoData || typeof textoData !== 'string') return 0;
        const partes = textoData.trim().split('/');
        if (partes.length !== 3) return 0;
        const [dia, mes, ano] = partes.map(Number);
        return new Date(ano, mes - 1, dia).getTime();
    }

    /* 2. Obter a maior data de referência ou o dia atual */
    function obterDataReferencia(listaItens = []) {
        let maiorTimestamp = 0;
        listaItens.forEach(item => {
            const t = converterData(item.data);
            if (t > maiorTimestamp) maiorTimestamp = t;
        });
        return maiorTimestamp > 0 ? new Date(maiorTimestamp) : new Date();
    }

    /* 3. Controlo de seta de ano superior no Flatpickr */
    function verificarSetaAno(instance) {
        if (!instance || !instance.calendarContainer) return;
        const anoAtual = new Date().getFullYear();
        const noAnoAtual = instance.currentYear >= anoAtual;
        instance.calendarContainer.classList.toggle("ano-limite-atual", noAnoAtual);

        const arrowUp = instance.calendarContainer.querySelector('.numInputWrapper span.arrowUp') || 
                        instance.calendarContainer.querySelector('.arrowUp');
        if (arrowUp) {
            arrowUp.style.display = noAnoAtual ? 'none' : 'block';
        }
    }

    /* 4. Criar configuração partilhada para Flatpickr */
    function obterConfigBase(opcoesCustomizadas = {}) {
        return {
            locale: "pt",
            dateFormat: "d/m/Y",
            disableMobile: true,
            allowInput: true,
            static: false,
            maxDate: "today",
            prevArrow: '<i class="fa-solid fa-chevron-left"></i>',
            nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
            onReady: function (selectedDates, dateStr, instance) {
                const selectNat = instance.calendarContainer.querySelector(".flatpickr-monthDropdown-months");
                if (!selectNat) return;
                selectNat.style.display = "none";

                const btnMes = document.createElement("button");
                btnMes.type = "button";
                btnMes.className = "btn-mes-custom";
                btnMes.innerHTML = `<span>${mesesNomes[instance.currentMonth]}</span> <i class="fa-solid fa-angle-down"></i>`;
                selectNat.parentNode.insertBefore(btnMes, selectNat);

                const menuDrop = document.createElement("div");
                menuDrop.className = "menu-meses-dropdown oculto";

                mesesNomes.forEach((nome, idx) => {
                    const item = document.createElement("div");
                    item.className = `item-mes ${idx === instance.currentMonth ? "selecionado" : ""}`;
                    item.textContent = nome;

                    item.addEventListener("click", (e) => {
                        e.stopPropagation();
                        instance.changeMonth(idx, false);
                        btnMes.querySelector("span").textContent = nome;
                        menuDrop.querySelectorAll(".item-mes").forEach(i => i.classList.remove("selecionado"));
                        item.classList.add("selecionado");
                        menuDrop.classList.add("oculto");
                        btnMes.classList.remove("ativo");
                    });

                    menuDrop.appendChild(item);
                });

                instance.calendarContainer.appendChild(menuDrop);

                btnMes.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const fechado = menuDrop.classList.toggle("oculto");
                    btnMes.classList.toggle("ativo", !fechado);
                });

                instance.config.onMonthChange.push(() => {
                    const mesAtual = instance.currentMonth;
                    btnMes.querySelector("span").textContent = mesesNomes[mesAtual];
                    menuDrop.querySelectorAll(".item-mes").forEach((item, idx) => {
                        item.classList.toggle("selecionado", idx === mesAtual);
                    });
                    setTimeout(() => verificarSetaAno(instance), 10);
                });

                document.addEventListener("click", (e) => {
                    if (!menuDrop.contains(e.target) && e.target !== btnMes) {
                        menuDrop.classList.add("oculto");
                        btnMes.classList.remove("ativo");
                    }
                });

                verificarSetaAno(instance);
            },
            onOpen: function (selectedDates, dateStr, instance) {
                verificarSetaAno(instance);
            },
            onYearChange: function (selectedDates, dateStr, instance) {
                setTimeout(() => verificarSetaAno(instance), 10);
            },
            ...opcoesCustomizadas
        };
    }

    /* 5. Inicializar calendário num elemento ou seletor */
    function anexar(seletorOuElemento, opcoes = {}) {
        if (typeof flatpickr === "undefined") {
            console.error("Flatpickr não foi carregado. Verifique as tags <script> no <head>.");
            return null;
        }

        const elemento = typeof seletorOuElemento === 'string'
            ? document.querySelector(seletorOuElemento)
            : seletorOuElemento;

        if (!elemento) return null;

        const config = obterConfigBase(opcoes);
        const fp = flatpickr(elemento, config);

        // Suporte para abrir ao clicar no ícone do calendário vizinho
        const icone = elemento.parentElement?.querySelector("i");
        if (icone) {
            icone.style.cursor = "pointer";
            icone.addEventListener("click", (e) => {
                e.stopPropagation();
                fp.open();
            });
        }

        return fp;
    }

    return {
        converterData,
        obterDataReferencia,
        obterConfigBase,
        anexar
    };
})();

window.GerenciadorDatas = GerenciadorDatas;

/* Inicialização automática dos campos padrão na página */
document.addEventListener("DOMContentLoaded", () => {
    ["#data", "#editItemData"].forEach(seletor => {
        GerenciadorDatas.anexar(seletor);
    });
});