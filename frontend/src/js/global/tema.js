/* ==========================================================
   GERENCIADOR GLOBAL DE TEMA (DARK/LIGHT MODE)
   ========================================================== */

// 1. Aplica o tema imediatamente ao carregar o script (evita flash branco)
const temaSalvo = localStorage.getItem('tema') || 'light';
document.documentElement.setAttribute('data-theme', temaSalvo);

// 2. Função global para que outras páginas possam alterar o tema
window.alternarTemaGlobal = function(novoTema) {
    // Aplica no HTML e salva no navegador
    document.documentElement.setAttribute('data-theme', novoTema);
    localStorage.setItem('tema', novoTema);

    // Atualiza todos os botões de tema (.btn-tema) espalhados pelo sistema
    document.querySelectorAll('.btn-tema i').forEach(icone => {
        icone.className = novoTema === 'dark' ? 'fi fi-rc-moon' : 'fi fi-rr-brightness';
    });

    // Se a página de configurações estiver aberta, sincroniza o interruptor
    const switchConfig = document.getElementById('prefTema');
    if (switchConfig) {
        switchConfig.checked = (novoTema === 'dark');
    }
};

// 3. Após o DOM carregar, vincula os cliques nos botões (.btn-tema)
document.addEventListener('DOMContentLoaded', () => {
    // Garante que os ícones começam com o desenho correto
    document.querySelectorAll('.btn-tema i').forEach(icone => {
        icone.className = temaSalvo === 'dark' ? 'fi fi-rc-moon' : 'fi fi-rr-brightness';
    });

    // Adiciona o evento de clique a todos os botões de tema do sistema
    document.querySelectorAll('.btn-tema').forEach(btn => {
        btn.addEventListener('click', () => {
            const temaAtual = document.documentElement.getAttribute('data-theme');
            const novoTema = temaAtual === 'light' ? 'dark' : 'light';
            
            window.alternarTemaGlobal(novoTema);
        });
    });
});