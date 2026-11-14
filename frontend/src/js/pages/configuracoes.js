function mascararTelefone(valor) {
    return valor.replace(/\D/g, '').slice(0, 11)
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

function mascararCPF(valor) {
    return valor.replace(/\D/g, '').slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function definirErro(campoId, mensagem) {
    const input = document.getElementById(campoId);
    const msgEl = document.getElementById(`${campoId}Erro`);
    if (input) input.classList.toggle('erro', Boolean(mensagem));
    if (msgEl) msgEl.textContent = mensagem || '';
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.toggle('erro', tipo === 'erro');
    toast.classList.add('mostrar');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('mostrar'), 3500);
}

function obterCamposPessoais() {
    return {
        name: document.getElementById('campoNome')?.value.trim() || '',
        email: document.getElementById('campoEmail')?.value.trim() || '',
        phone: document.getElementById('campoTelefone')?.value.replace(/\D/g, '') || ''
    };
}

function preencherFormulario(user) {
    const nome = document.getElementById('campoNome');
    const email = document.getElementById('campoEmail');
    const telefone = document.getElementById('campoTelefone');
    const cpf = document.getElementById('campoCpf');
    const rgm = document.getElementById('campoRgm');
    if (nome) nome.value = user.name || '';
    if (email) email.value = user.email || '';
    if (telefone) telefone.value = mascararTelefone(user.phone || '');
    if (cpf) cpf.value = mascararCPF(user.cpf || '');
    if (rgm) rgm.value = user.rgm || '';

    const nomeExibicao = document.getElementById('nomeExibicao');
    if (nomeExibicao) nomeExibicao.textContent = user.name || '';
    const avatar = document.getElementById('avatarIniciais');
    if (avatar) avatar.textContent = (user.name || 'U').trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
    const perfil = document.getElementById('textoPerfilInstituicao');
    if (perfil) perfil.textContent = user.profile || '';
}

function limparSenhas() {
    ['senhaAtual', 'senhaNova', 'senhaConfirmar'].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = '';
        definirErro(id, '');
    });
}

function inicializar(user) {
    const api = window.PerdidexApi;
    if (!api || !user) return;
    preencherFormulario(user);

    document.getElementById('campoTelefone')?.addEventListener('input', (event) => {
        event.target.value = mascararTelefone(event.target.value);
    });
    document.querySelectorAll('.alt-senha').forEach((botao) => {
        botao.innerHTML = '<i class="fa-regular fa-eye"></i>';
        botao.addEventListener('click', () => {
            const input = botao.closest('.campo-input-wrap')?.querySelector('input');
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
            botao.innerHTML = input.type === 'password'
                ? '<i class="fa-regular fa-eye"></i>'
                : '<i class="fa-regular fa-eye-slash"></i>';
        });
    });

    const tema = document.getElementById('prefTema');
    if (tema) {
        tema.checked = (localStorage.getItem('tema') || 'light') === 'dark';
        tema.addEventListener('change', (event) => {
            const novoTema = event.target.checked ? 'dark' : 'light';
            if (typeof window.alternarTemaGlobal === 'function') {
                window.alternarTemaGlobal(novoTema);
            } else {
                document.documentElement.setAttribute('data-theme', novoTema);
                localStorage.setItem('tema', novoTema);
            }
        });
    }

    document.getElementById('formConfiguracoes')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dados = obterCamposPessoais();
        let valido = true;
        if (dados.name.length < 3) {
            definirErro('campoNome', 'Informe seu nome completo');
            valido = false;
        } else definirErro('campoNome', '');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
            definirErro('campoEmail', 'Informe um e-mail válido');
            valido = false;
        } else definirErro('campoEmail', '');
        if (dados.phone.length < 10) {
            definirErro('campoTelefone', 'Informe um telefone válido');
            valido = false;
        } else definirErro('campoTelefone', '');

        const atual = document.getElementById('senhaAtual')?.value || '';
        const nova = document.getElementById('senhaNova')?.value || '';
        const confirmar = document.getElementById('senhaConfirmar')?.value || '';
        const alterarSenha = Boolean(atual || nova || confirmar);
        if (alterarSenha) {
            if (!atual) {
                definirErro('senhaAtual', 'Informe sua senha atual');
                valido = false;
            } else definirErro('senhaAtual', '');
            if (nova.length < 8) {
                definirErro('senhaNova', 'Use pelo menos 8 caracteres');
                valido = false;
            } else definirErro('senhaNova', '');
            if (nova !== confirmar) {
                definirErro('senhaConfirmar', 'As senhas não coincidem');
                valido = false;
            } else definirErro('senhaConfirmar', '');
        } else limparSenhas();
        if (!valido) {
            mostrarToast('Verifique os campos destacados.', 'erro');
            return;
        }

        const submit = event.currentTarget.querySelector('[type="submit"]');
        if (submit) submit.disabled = true;
        let perfilSalvo = false;
        try {
            if (dados.name !== user.name || dados.email !== user.email || dados.phone !== (user.phone || '').replace(/\D/g, '')) {
                user = await api.patch('/users/me', dados);
                window.PerdidexUser = user;
                window.dispatchEvent(new CustomEvent('usuarioAtualizado', { detail: user }));
                preencherFormulario(user);
            }
            perfilSalvo = true;
            if (alterarSenha) {
                await api.patch('/users/me/password', {
                    current_password: atual,
                    new_password: nova
                });
            }
            limparSenhas();
            mostrarToast('Alterações salvas com sucesso!');
        } catch (error) {
            mostrarToast(
                perfilSalvo
                    ? `Dados pessoais salvos, mas não foi possível alterar a senha: ${error.message}`
                    : `Não foi possível salvar as alterações: ${error.message}`,
                'erro'
            );
        } finally {
            if (submit) submit.disabled = false;
        }
    });

    document.getElementById('btnCancelar')?.addEventListener('click', () => {
        preencherFormulario(user);
        limparSenhas();
        ['campoNome', 'campoEmail', 'campoTelefone'].forEach((id) => definirErro(id, ''));
    });

    const overlay = document.getElementById('overlayExcluir');
    document.getElementById('btnAbrirExcluir')?.addEventListener('click', () => {
        const senha = document.getElementById('senhaExcluir');
        if (senha) senha.value = '';
        overlay?.classList.add('aberto');
    });
    document.getElementById('btnCancelarExcluir')?.addEventListener('click', () => overlay?.classList.remove('aberto'));
    overlay?.addEventListener('click', (event) => {
        if (event.target === overlay) overlay.classList.remove('aberto');
    });
    document.getElementById('btnConfirmarExcluir')?.addEventListener('click', async (event) => {
        const senha = document.getElementById('senhaExcluir')?.value || '';
        if (!senha) {
            mostrarToast('Informe sua senha para confirmar.', 'erro');
            return;
        }
        const button = event.currentTarget;
        button.disabled = true;
        let redirectDelay = 0;
        try {
            await api.delete('/users/me', { body: { current_password: senha } });
            try {
                await api.logout();
            } catch (logoutError) {
                mostrarToast(`Conta desativada, mas não foi possível limpar o cookie da sessão: ${logoutError.message}`, 'erro');
                redirectDelay = 3500;
            }
            setTimeout(() => window.location.replace('/pages/auth/index.html?mode=login'), redirectDelay);
        } catch (error) {
            mostrarToast(`Não foi possível desativar a conta: ${error.message}`, 'erro');
        } finally {
            button.disabled = false;
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') overlay?.classList.remove('aberto');
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.PerdidexSession?.ready;
    if (user) inicializar(user);
});
