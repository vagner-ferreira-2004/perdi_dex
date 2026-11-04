document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.PerdidexSession?.ready;
    if (!user || user.role !== 'admin') return;

    const list = document.getElementById('listaAnalises');
    const count = document.getElementById('totalPendentes');
    const message = document.getElementById('mensagemAnalises');
    if (!list || !count || !message) return;

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.toggle('analise-erro', isError);
        message.setAttribute('role', isError ? 'alert' : 'status');
    }

    function createItemCard(item) {
        const card = document.createElement('article');
        card.className = 'analise-item';
        card.dataset.id = item.id_object;

        const image = document.createElement('img');
        image.src = item.photo?.url || '';
        image.alt = `Foto de ${item.category?.name || 'item encontrado'}`;

        const content = document.createElement('div');
        content.className = 'analise-conteudo';
        const title = document.createElement('h2');
        title.textContent = item.category?.name || 'Item sem categoria';
        const metadata = document.createElement('p');
        metadata.className = 'analise-metadados';
        metadata.textContent = [
            item.location?.central_place,
            item.location?.description,
            item.found_date ? new Date(`${item.found_date}T00:00:00`).toLocaleDateString('pt-BR') : ''
        ].filter(Boolean).join(' · ');
        const description = document.createElement('p');
        description.textContent = item.characteristic?.description || '';
        const details = document.createElement('p');
        details.className = 'analise-metadados';
        details.textContent = [
            item.characteristic?.color,
            item.characteristic?.brand
        ].filter(Boolean).join(' · ');

        const actions = document.createElement('div');
        actions.className = 'analise-acoes';
        const reason = document.createElement('input');
        reason.className = 'analise-motivo';
        reason.type = 'text';
        reason.maxLength = 1000;
        reason.placeholder = 'Motivo obrigatório para reprovar';
        reason.setAttribute('aria-label', 'Motivo da reprovação');
        const approve = document.createElement('button');
        approve.className = 'btn btn-primario';
        approve.type = 'button';
        approve.textContent = 'Aprovar';
        const reject = document.createElement('button');
        reject.className = 'btn btn-perigo-cheio';
        reject.type = 'button';
        reject.textContent = 'Reprovar';

        async function review(decision) {
            const rejectionReason = reason.value.trim();
            if (decision === 'reject' && !rejectionReason) {
                showMessage('Informe o motivo antes de reprovar o cadastro.', true);
                reason.focus();
                return;
            }
            approve.disabled = true;
            reject.disabled = true;
            try {
                await window.PerdidexApi.patch(`/admin/objects-found/${item.id_object}/review`, {
                    decision,
                    reason: decision === 'reject' ? rejectionReason : null
                });
                card.remove();
                const remaining = list.querySelectorAll('.analise-item').length;
                count.textContent = `${remaining} pendente${remaining === 1 ? '' : 's'}`;
                showMessage(decision === 'approve' ? 'Cadastro aprovado e publicado.' : 'Cadastro reprovado com motivo registrado.');
                if (!remaining) list.textContent = 'Não há cadastros pendentes.';
            } catch (error) {
                showMessage(`Não foi possível revisar o cadastro: ${error.message}`, true);
                approve.disabled = false;
                reject.disabled = false;
            }
        }

        approve.addEventListener('click', () => review('approve'));
        reject.addEventListener('click', () => review('reject'));
        actions.append(reason, approve, reject);
        content.append(title, metadata, description, details, actions);
        card.append(image, content);
        return card;
    }

    const pending = [];
    let page = 1;
    let total = 0;
    try {
        do {
            const response = await window.PerdidexApi.get(
                `/admin/objects-found?status=Pendente&page=${page}&per_page=100`
            );
            pending.push(...(response.items || []));
            total = response.total || 0;
            page += 1;
        } while (pending.length < total);
        count.textContent = `${pending.length} pendente${pending.length === 1 ? '' : 's'}`;
        if (!pending.length) {
            list.textContent = 'Não há cadastros pendentes.';
            return;
        }
        pending.forEach((item) => list.append(createItemCard(item)));
    } catch (error) {
        count.textContent = 'Indisponível';
        showMessage(`Não foi possível carregar os cadastros: ${error.message}`, true);
    }
});
