document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.PerdidexSession?.ready;
    if (!user || !window.PerdidexApi) return;

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
        image.alt = `Foto de ${dispute.item?.category?.name || 'item'}`;
        const content = document.createElement('div');
        content.className = 'analise-conteudo';
        const title = document.createElement('h2');
        title.textContent = `Contestação #${dispute.id_dispute} — ${dispute.item?.category?.name || 'Item'}`;
        const metadata = document.createElement('p');
        metadata.className = 'analise-metadados';
        metadata.textContent = `${dispute.status}${dispute.decision ? ` — ${dispute.decision}` : ''} · ${dispute.item?.location?.central_place || ''}`;
        const itemDescription = document.createElement('p');
        itemDescription.textContent = dispute.item?.characteristic?.description || '';
        const description = document.createElement('p');
        description.textContent = dispute.description;
        const result = document.createElement('p');
        result.textContent = dispute.reason ? `Motivo da decisão: ${dispute.reason}` : '';
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
        content.append(title, metadata, itemDescription, description, result, evidence);
        card.append(image, content);
        return card;
    }

    try {
        const entries = [];
        let page = 1;
        let total = 0;
        do {
            const response = await window.PerdidexApi.get(`/disputes?page=${page}&per_page=100`);
            entries.push(...response.items);
            total = response.total || 0;
            page += 1;
        } while (entries.length < total);
        count.textContent = `${total} ${total === 1 ? 'contestação' : 'contestações'}`;
        if (!entries.length) {
            list.textContent = 'Você ainda não enviou contestações.';
            return;
        }
        entries.forEach((entry) => list.append(createCard(entry)));
    } catch (error) {
        count.textContent = 'Indisponível';
        showMessage(`Não foi possível carregar suas contestações: ${error.message}`, true);
    }
});
