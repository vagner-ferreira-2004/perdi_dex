function exibirMensagemCadastro(mensagem, erro = false) {
    if (typeof GerenciadorToast !== 'undefined') {
        GerenciadorToast.exibir(mensagem);
        return;
    }
    let aviso = document.getElementById('cadastroItemAviso');
    if (!aviso) {
        aviso = document.createElement('p');
        aviso.id = 'cadastroItemAviso';
        aviso.setAttribute('role', erro ? 'alert' : 'status');
        document.querySelector('form.cadastro')?.prepend(aviso);
    }
    aviso.textContent = mensagem;
    aviso.classList.toggle('erro', erro);
}

function dataUrlParaArquivo(dataUrl, filename) {
    const [header, encoded] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
    const bytes = atob(encoded);
    const buffer = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) {
        buffer[index] = bytes.charCodeAt(index);
    }
    return new File([buffer], filename, { type: mime });
}

function preencherCatalogo(container, entries, valueKey, labelFor) {
    const dropdown = container.querySelector('.select-dropdown');
    if (!dropdown) return;
    dropdown.replaceChildren();
    const placeholder = document.createElement('div');
    placeholder.className = 'option selecione';
    placeholder.dataset.value = '';
    placeholder.textContent = container.id === 'seletorLocal'
        ? 'Selecione o local...'
        : 'Selecione uma categoria...';
    dropdown.append(placeholder);

    entries.forEach((entry) => {
        const option = document.createElement('div');
        option.className = 'option';
        option.dataset.value = entry[valueKey];
        option.textContent = labelFor(entry);
        dropdown.append(option);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('form.cadastro');
    if (!form) return;

    const api = window.PerdidexApi;
    if (!api) {
        exibirMensagemCadastro('Não foi possível carregar o cliente da API.', true);
        return;
    }

    let categorias;
    let locais;
    try {
        const [categoriasResponse, locaisResponse] = await Promise.all([
            api.get('/categories'),
            api.get('/locations')
        ]);
        categorias = categoriasResponse.items || [];
        locais = locaisResponse.items || [];
        preencherCatalogo(
            document.querySelector('#categoria')?.closest('.custom-select-container'),
            categorias,
            'id_category',
            (item) => item.name
        );
        preencherCatalogo(
            document.querySelector('#seletorLocal'),
            locais,
            'id_location',
            (item) => [item.central_place, item.description].filter(Boolean).join(' - ')
        );
    } catch (error) {
        exibirMensagemCadastro(`Não foi possível carregar categorias e locais: ${error.message}`, true);
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const photoData = form.querySelector('.upload-base64-input')?.value || '';
        const dateValue = document.getElementById('data')?.value || '';
        const [day, month, year] = dateValue.split('/');
        if (!photoData.startsWith('data:image/')) {
            exibirMensagemCadastro('Adicione uma foto válida do item.', true);
            return;
        }
        if (!day || !month || !year) {
            exibirMensagemCadastro('Informe uma data válida.', true);
            return;
        }

        const body = new FormData();
        body.append('id_category', document.getElementById('categoria').value);
        body.append('id_location', document.getElementById('local').value);
        body.append('color', document.getElementById('cor').value);
        body.append('brand', document.getElementById('marca').value.trim() || 'Desconhecida');
        body.append('description', document.getElementById('descricao').value.trim());
        body.append('found_date', `${year}-${month}-${day}`);
        body.append('photo', dataUrlParaArquivo(photoData, 'item.jpg'));

        const button = form.querySelector('[type="submit"]');
        if (button) button.disabled = true;
        try {
            await api.post('/objects-found', body);
            form.reset();
            const preview = form.querySelector('.upload-preview');
            const placeholder = form.querySelector('.upload-placeholder');
            const filename = form.querySelector('.upload-filename');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = 'flex';
            if (filename) {
                filename.textContent = '';
                filename.style.display = 'none';
            }
            form.querySelectorAll('.custom-select-container').forEach((container) => {
                container.querySelector('.select-btn')?.classList.remove('tem-valor');
                const label = container.querySelector('.select-btn-text');
                if (label) {
                    label.textContent = container.id === 'seletorLocal'
                        ? 'Selecione o local...'
                        : container.querySelector('#cor')
                            ? 'Selecione uma cor...'
                            : 'Selecione uma categoria...';
                }
            });
            if (document.getElementById('data')?._flatpickr) {
                document.getElementById('data')._flatpickr.clear();
            }
            exibirMensagemCadastro('Item cadastrado e enviado para análise.');
            window.dispatchEvent(new CustomEvent('itemCadastrado'));
        } catch (error) {
            exibirMensagemCadastro(`Não foi possível cadastrar o item: ${error.message}`, true);
        } finally {
            if (button) button.disabled = false;
        }
    });
});
