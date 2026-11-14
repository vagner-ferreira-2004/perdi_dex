document.addEventListener('DOMContentLoaded', () => {
    const api = window.PerdidexApi;
    const loginForm = document.querySelector('.sign-in-form');
    const registerForm = document.querySelector('.sign-up-form');
    if (!api || !loginForm || !registerForm) return;

    function setFeedback(form, message, isError) {
        const feedback = form.querySelector('.form-feedback');
        if (!feedback) return;
        feedback.textContent = message;
        feedback.classList.toggle('erro', Boolean(isError));
        feedback.hidden = !message;
    }

    function setSubmitting(form, isSubmitting) {
        const button = form.querySelector('button[type="submit"]');
        if (!button) return;
        button.disabled = isSubmitting;
        button.setAttribute('aria-busy', String(isSubmitting));
    }

    function digits(value) {
        return value.replace(/\D/g, '');
    }

    function inputValue(form, selector) {
        return form.querySelector(selector)?.value.trim() || '';
    }

    function configureProfiles() {
        const profileSelect = document.getElementById('perfilSelect');
        const hiddenInput = document.getElementById('perfil-selecionado');
        if (!profileSelect || !hiddenInput) return;

        api.get('/profiles')
            .then((response) => {
                const profiles = response.items || [];
                const options = profileSelect.querySelectorAll('.option[data-profile-name]');
                options.forEach((option) => {
                    const profile = profiles.find((item) => item.name === option.dataset.profileName);
                    if (profile) {
                        option.dataset.value = String(profile.id_profile);
                    } else {
                        option.remove();
                    }
                });
            })
            .catch((error) => {
                setFeedback(registerForm, error.message, true);
                registerForm.querySelector('button[type="submit"]').disabled = true;
            });
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFeedback(loginForm, '', false);
        setSubmitting(loginForm, true);

        try {
            await api.post('/auth/login', {
                email: inputValue(loginForm, '[name="email"]'),
                password: inputValue(loginForm, '[name="senha"]')
            });
            const response = await api.get('/users/me');
            const destination = response.role === 'admin'
                ? '/pages/admin/index.html'
                : '/pages/user/index.html';
            window.location.assign(destination);
        } catch (error) {
            setFeedback(loginForm, error.message, true);
        } finally {
            setSubmitting(loginForm, false);
        }
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFeedback(registerForm, '', false);

        const password = inputValue(registerForm, '#senha-cadastro');
        const confirmation = inputValue(registerForm, '#confirmar-senha');
        if (password !== confirmation) {
            setFeedback(registerForm, 'As senhas não coincidem.', true);
            return;
        }
        if (password.length < 8) {
            setFeedback(registerForm, 'A senha precisa ter pelo menos 8 caracteres.', true);
            return;
        }

        const profileId = Number(inputValue(registerForm, '#perfil-selecionado'));
        const profileOption = registerForm.querySelector(
            `.option[data-value="${profileId}"]`
        );
        if (!profileId || !profileOption) {
            setFeedback(registerForm, 'Selecione seu perfil na faculdade.', true);
            return;
        }

        const profileName = profileOption.dataset.profileName;
        const rgm = inputValue(registerForm, '#rgm-input');
        if (profileName === 'student' && !rgm) {
            setFeedback(registerForm, 'Informe seu RGM para continuar.', true);
            return;
        }

        setSubmitting(registerForm, true);
        try {
            await api.post('/auth/register', {
                name: inputValue(registerForm, '[name="nome"]'),
                cpf: digits(inputValue(registerForm, '[name="cpf"]')),
                phone: inputValue(registerForm, '[name="telefone"]'),
                email: inputValue(registerForm, '[name="email"]'),
                rgm: rgm || null,
                password,
                id_profile: profileId
            });
            const email = inputValue(registerForm, '[name="email"]');
            loginForm.querySelector('[name="email"]').value = email;
            registerForm.reset();
            const profileLabel = document.querySelector('#perfilSelect .select-btn span');
            if (profileLabel) profileLabel.textContent = 'Selecione um perfil...';
            document.querySelector('#perfilSelect .select-btn')?.classList.remove('tem-valor');
            document.getElementById('rgm-container').style.display = 'none';
            const signInButton = document.getElementById('sign-in-btn');
            signInButton?.click();
            setFeedback(loginForm, 'Cadastro realizado. Entre com seu e-mail e senha.', false);
        } catch (error) {
            setFeedback(registerForm, error.message, true);
        } finally {
            setSubmitting(registerForm, false);
        }
    });

    configureProfiles();
    api.refreshCsrfToken().catch((error) => {
        setFeedback(loginForm, error.message, true);
        setFeedback(registerForm, error.message, true);
        loginForm.querySelector('button[type="submit"]').disabled = true;
        registerForm.querySelector('button[type="submit"]').disabled = true;
    });
});
