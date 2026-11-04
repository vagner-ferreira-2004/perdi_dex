document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.PerdidexSession?.ready;
    if (!user || user.role !== 'admin') return;

    const list = document.getElementById('listaContestacoes');
    const count = document.getElementById('totalContestacoes');
    const message = document.getElementById('mensagemContestacoes');

    function showMessage(text, error = false) {
        message.textContent = text;
        message.classList.toggle('analise-erro', error);
        message.setAttribute('role', error ? 'alert' : 'status');
    }

    function createCard(dispute) {
        const card = document.createElement('article');
        card.className = 'analise-item';
        const image = document.createElement('img');
        image.src = dispute.item?.photo?.url || '';
        image.alt = `Foto do item ${dispute.item?.category?.name || ''}`;
        const content = document.createElement('div');
        content.className = 'analise-conteudo';
        const title = document.createElement('h2');
        title.textContent = `Contestação #${dispute.id_dispute} — ${dispute.item?.category?.name || 'Item'}`;
        const metadata = document.createElement('p');
        metadata.className = 'analise-metadados';
        metadata.textContent = `Solicitante #${dispute.id_user} · ${dispute.item?.location?.central_place || ''} · ${dispute.item?.found_date || ''}`;
        const description = document.createElement('p');
        description.textContent = dispute.description;
        const evidence = document.createElement('div');
        evidence.className = 'analise-evidencias';
        dispute.evidence.forEach((file, index) => {
            const link = document.createElement('a');
            link.href = file.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = `Ver evidência ${index + 1}`;
            evidence.append(link);
        });
        if (!dispute.evidence.length) {
            evidence.textContent = 'Nenhum anexo enviado; considere a descrição e os demais dados disponíveis.';
        }
        const reason = document.createElement('input');
        reason.className = 'analise-motivo';
        reason.type = 'text';
        reason.maxLength = 1000;
        reason.placeholder = 'Motivo obrigatório para recusar';
        reason.setAttribute('aria-label', 'Motivo da recusa');
        const actions = document.createElement('div');
        actions.className = 'analise-acoes';
        const accept = document.createElement('button');
        accept.className = 'btn btn-primario';
        accept.textContent = 'Aceitar contestação';
        accept.type = 'button';
        const reject = document.createElement('button');
        reject.className = 'btn btn-perigo-cheio';
        reject.textContent = 'Recusar';
        reject.type = 'button';

        async function decide(decision) {
            const rejectionReason = reason.value.trim();
            if (decision === 'reject' && !rejectionReason) {
                showMessage('Informe o motivo da recusa.', true);
                reason.focus();
                return;
            }
            accept.disabled = true;
            reject.disabled = true;
            try {
                await window.PerdidexApi.patch(`/admin/disputes/${dispute.id_dispute}/review`, {
                    decision,
                    reason: decision === 'reject' ? rejectionReason : null
                });
                card.remove();
                const remaining = list.querySelectorAll('.analise-item').length;
                count.textContent = `${remaining} pendente${remaining === 1 ? '' : 's'}`;
                if (!remaining) list.textContent = 'Não há contestações pendentes.';
                showMessage(decision === 'accept' ? 'Contestação aceita; o item voltou ao catálogo.' : 'Contestação recusada.');
            } catch (error) {
                showMessage(`Não foi possível revisar a contestação: ${error.message}`, true);
                accept.disabled = false;
                reject.disabled = false;
            }
        }

        accept.addEventListener('click', () => decide('accept'));
        reject.addEventListener('click', () => decide('reject'));
        actions.append(reason, accept, reject);
        content.append(title, metadata, description, evidence, actions);
        card.append(image, content);
        return card;
    }

    try {
        const response = await window.PerdidexApi.get('/admin/disputes?status=Pendente&per_page=100');
        count.textContent = `${response.total} pendente${response.total === 1 ? '' : 's'}`;
        if (!response.items.length) {
            list.textContent = 'Não há contestações pendentes.';
            return;
        }
        response.items.forEach((entry) => list.append(createCard(entry)));
    } catch (error) {
        count.textContent = 'Indisponível';
        showMessage(`Não foi possível carregar as contestações: ${error.message}`, true);
    }
});
