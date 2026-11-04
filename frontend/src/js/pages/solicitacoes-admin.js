document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.PerdidexSession?.ready;
    if (!user || user.role !== 'admin') return;

    const list = document.getElementById('listaSolicitacoes');
    const count = document.getElementById('totalSolicitacoes');
    const message = document.getElementById('mensagemSolicitacoes');

    function showMessage(text, error = false) {
        message.textContent = text;
        message.classList.toggle('analise-erro', error);
        message.setAttribute('role', error ? 'alert' : 'status');
    }

    function createCard(entry) {
        const card = document.createElement('article');
        card.className = 'analise-item';
        const image = document.createElement('img');
        image.src = entry.item?.photo?.url || '';
        image.alt = `Foto de ${entry.item?.category?.name || 'item'}`;
        const content = document.createElement('div');
        content.className = 'analise-conteudo';
        const title = document.createElement('h2');
        title.textContent = `Pedido #${entry.id_pickup_request} — ${entry.item?.category?.name || 'Item'}`;
        const metadata = document.createElement('p');
        metadata.className = 'analise-metadados';
        metadata.textContent = `Solicitante #${entry.id_user} · ${entry.item?.location?.central_place || ''} · ${entry.item?.found_date || ''}`;
        const description = document.createElement('p');
        description.textContent = entry.item?.characteristic?.description || '';
        const reason = document.createElement('input');
        reason.className = 'analise-motivo';
        reason.type = 'text';
        reason.maxLength = 1000;
        reason.placeholder = 'Motivo obrigatório para recusar';
        reason.setAttribute('aria-label', 'Motivo da recusa');
        const actions = document.createElement('div');
        actions.className = 'analise-acoes';
        const approve = document.createElement('button');
        approve.className = 'btn btn-primario';
        approve.textContent = 'Aprovar';
        approve.type = 'button';
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
            approve.disabled = true;
            reject.disabled = true;
            try {
                await window.PerdidexApi.patch(
                    `/admin/pickup-requests/${entry.id_pickup_request}/review`,
                    { decision, reason: decision === 'reject' ? rejectionReason : null }
                );
                card.remove();
                const remaining = list.querySelectorAll('.analise-item').length;
                count.textContent = `${remaining} pendente${remaining === 1 ? '' : 's'}`;
                if (!remaining) list.textContent = 'Não há pedidos pendentes.';
                showMessage(decision === 'approve' ? 'Pedido aprovado.' : 'Pedido recusado.');
            } catch (error) {
                showMessage(`Não foi possível decidir o pedido: ${error.message}`, true);
                approve.disabled = false;
                reject.disabled = false;
            }
        }

        approve.addEventListener('click', () => decide('approve'));
        reject.addEventListener('click', () => decide('reject'));
        actions.append(reason, approve, reject);
        content.append(title, metadata, description, actions);
        card.append(image, content);
        return card;
    }

    try {
        const response = await window.PerdidexApi.get('/admin/pickup-requests?status=Pendente&per_page=100');
        count.textContent = `${response.total} pendente${response.total === 1 ? '' : 's'}`;
        if (!response.items.length) {
            list.textContent = 'Não há pedidos pendentes.';
            return;
        }
        response.items.forEach((entry) => list.append(createCard(entry)));
    } catch (error) {
        count.textContent = 'Indisponível';
        showMessage(`Não foi possível carregar os pedidos: ${error.message}`, true);
    }
});
