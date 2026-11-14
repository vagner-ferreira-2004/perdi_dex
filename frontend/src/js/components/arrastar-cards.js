// Seleciona todas as áreas que terão o efeito de arrastar. 
// Adicione a classe '.area-arrastavel' (ou a sua classe padrão) no HTML de cada contêiner.
const sliders = document.querySelectorAll('.area-arrastavel');

// Função adaptada para receber um slider específico como parâmetro
function verificarRolagem(slider) {
    if (slider.scrollWidth > slider.clientWidth) {
        slider.classList.add('arrastar');
    } else {
        slider.classList.remove('arrastar');
    }
}

// Passa por cada slider encontrado na página para aplicar as regras
sliders.forEach(slider => {
    // 1. Executa a verificação inicial para este slider específico
    verificarRolagem(slider);

    // Variáveis de controle isoladas para cada slider
    let isDown = false; 
    let startX; 
    let scrollLeft; 

    // 2. Eventos de clique e movimento
    slider.addEventListener('mousedown', (e) => {
        if (!slider.classList.contains('arrastar')) return; 
        
        isDown = true;
        startX = e.pageX - slider.offsetLeft; 
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return; 
        e.preventDefault(); 
        
        const x = e.pageX - slider.offsetLeft; 
        const dist = (x - startX) * 2; 
        slider.scrollLeft = scrollLeft - dist;
    });
});

// Executa a verificação em TODOS os sliders caso a janela mude de tamanho
window.addEventListener('resize', () => {
    sliders.forEach(slider => verificarRolagem(slider));
});



/* ==========================================================
   FUNÇÃO PARA TABELAS ARRASTÁVEIS (DRAG TO SCROLL)
   ========================================================== */
function inicializarTabelasArrastaveis() {
    const containers = document.querySelectorAll('.table_container');

    containers.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        // Quando clica com o rato
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('arrastando');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        // Quando o rato sai da área da tabela
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('arrastando');
        });

        // Quando solta o clique do rato
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('arrastando');
        });

        // Quando move o rato clicado (arrastar)
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault(); // Previne comportamentos padrão
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5; // O '1.5' dita a velocidade do arraste (aumente se quiser mais rápido)
            slider.scrollLeft = scrollLeft - walk;
        });
    });
}

// Executar assim que o site carregar
document.addEventListener('DOMContentLoaded', () => {
    inicializarTabelasArrastaveis();
});