/* ==========================================================
   BANCO DE DADOS SIMULADO GLOBAL (SEM LOCALSTORAGE)
   ========================================================== */
window.BancoDeDados = (() => {
    // ==========================================
    // 1. DADOS DO UTILIZADOR EM MEMÓRIA
    // ==========================================
    const usuario = {
        nome: 'Natalia Souza Dias',
        email: 'natalia.dias005@cs.unicid.com',
        telefone: '(11) 90000-5609',
        cpf: '420.085.372-95',
        rgm: '42180382',
        membroDesde: '02/08/2026',
        perfil: 'Estudante',
        iconePerfil: 'fa-solid fa-user-graduate'
    };

    // ==========================================
    // 2. DADOS DO ADMINISTRADOR EM MEMÓRIA
    // ==========================================
    const administrador = {
        nome: 'Admin Perdidex',
        email: 'admin.perdidex@unicid.com',
        telefone: '(11) 99999-9999',
        cpf: '000.000.000-00',
        membroDesde: '01/08/2026',
        perfil: 'Administrador', 
        iconePerfil: 'fa-solid fa-user-gear'
    };
    
    // ==========================================
    // 3. LISTA DE ITENS DO SISTEMA
    // ==========================================
    const itens = [
        {
            id: 1,
            foto: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
            categoria: "Eletrônicos",
            descricao: "Fone de ouvido bluetooth, sem fio, na cor preta, com almofadas acolchoadas e cancelamento de ruído ativo. Possui controles laterais e estojo de transporte.",
            local: "Bloco D LAB.INF.2",
            data: "25/03/2026",
            corNome: "Preto",
            corClasse: "preto",
            marca: "Sony",
            status: "aprovado",
            meuCadastro: true,
            usuarioSolicitou: false,
            notificacaoLida: false
        },

        {
            id: 2,
            foto: "https://images.pexels.com/photos/16199096/pexels-photo-16199096/free-photo-of-close-up-of-keys-on-a-table.jpeg?auto=compress&dpr=1&w=500",
            categoria: "Chaves",
            descricao: "Conjunto com 3 chaves de metal na cor cinza, presas a um chaveiro pequeno de aparência rústica.",
            local: "Bloco G Sala 202",
            data: "14/05/2026",
            corNome: "Cinza",
            corClasse: "cinza",
            marca: "",
            status: "reprovado",
            meuCadastro: true,
            usuarioSolicitou: false,
            notificacaoLida: false,
            motivoReprovacao: "Foto não atende aos critérios. Envie uma foto mais nítida para a administração."
        },

        {
            id: 3,
            foto: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80",
            categoria: "Acessórios",
            descricao: "Carteira de couro marrom contendo apenas alguns cartões de visita.",
            local: "Bloco D LAB.INF.3",
            data: "11/09/2026",
            corNome: "Marrom",
            corClasse: "marrom",
            marca: "Fossil",
            status: "analise",
            meuCadastro: true,
            usuarioSolicitou: false,
            notificacaoLida: true
        },

        {
            id: 4,
            foto: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
            categoria: "Bolsas",
            descricao: "Mochila escolar grande na cor preta, com vários compartimentos e aproximadamente seis bolsos. O item possui espaço interno amplo para guardar cadernos, estojo e outros materiais escolares, além de alças acolchoadas e acabamento resistente para uso diário no ambiente universitário.",
            local: "Biblioteca Central",
            data: "01/08/2026",
            corNome: "Preto",
            corClasse: "preto",
            marca: "Nike",
            status: "solicitado",
            estadoSolicitacao: "analise",
            meuCadastro: false,
            usuarioSolicitou: true,
            notificacaoLida: true
        },

        {
            id: 5,
            foto: "https://images.oceans.tokyo.jp/media/article/40741/images/editor/d99a87a996d9aa2813a81759dbdcd3a07d36fc57.jpg?w=850",
            categoria: "Roupas",
            descricao: "Blusa de moletom cinza, tamanho G, sem bolso frontal e sem capuz. Possui gola redonda, mangas compridas e acabamento simples nas barras e punhos.",
            local: "Bloco G Sala 202",
            data: "14/09/2026",
            corNome: "Cinza",
            corClasse: "cinza",
            marca: "Puma",
            status: "solicitado",
            estadoSolicitacao: "reprovado",
            meuCadastro: false,
            usuarioSolicitou: true,
            notificacaoLida: false,
            motivoReprovacao: "Não foi possível confirmar a propriedade do item."
        },

        {
            id: 6,
            foto: "https://images.unsplash.com/photo-1622988238512-bb5ac2a726f8?w=500&q=80",
            categoria: "Utensílios",
            descricao: "Garrafa térmica de alumínio com capacidade aproximada de 1 litro, acabamento verde fosco e tampa rosqueável. O corpo possui formato cilíndrico e resistente, com estrutura adequada para transportar bebidas durante o dia, sendo um item bastante utilizado para aulas, estudos e atividades dentro da faculdade.",
            local: "Bloco Alfa Sala 301",
            data: "18/11/2025",
            corNome: "Verde",
            corClasse: "verde",
            marca: "Stanley",
            status: "solicitado",
            estadoSolicitacao: "aprovado",
            meuCadastro: false,
            usuarioSolicitou: true,
            notificacaoLida: false
        },

        {
            id: 7,
            foto: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80",
            categoria: "Eletrônicos",
            descricao: "Carregador portátil PowerBank 10000mAh, compacto e adequado para recarregar celulares e outros dispositivos.",
            local: "Bloco C Sala 104",
            data: "12/03/2026",
            corNome: "Branco",
            corClasse: "branco",
            marca: "Xiaomi",
            status: "aprovado",
            meuCadastro: false,
            usuarioSolicitou: false,
            notificacaoLida: true
        },

        {
            id: 8,
            foto: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
            categoria: "Documentos",
            descricao: "Porta-cartões preto compacto contendo um cartão de transporte em um dos compartimentos.",
            local: "Cantina Central",
            data: "05/04/2026",
            corNome: "Preto",
            corClasse: "preto",
            marca: "",
            status: "devolvido",
            meuCadastro: true,
            usuarioSolicitou: false,
            notificacaoLida: false
        },

        {
            id: 9,
            foto: "https://images.unsplash.com/photo-1624771678824-1cdb561f19b5?auto=format&fit=crop&fm=jpg&q=80&w=500",
            categoria: "Utensílios",
            descricao: "Guarda-chuva dobrável automático com cabo e detalhes na cor vermelha. Possui estrutura compacta e pode ser facilmente transportado dentro de uma mochila ou bolsa.",
            local: "Estacionamento Subsolo",
            data: "20/02/2026",
            corNome: "Vermelho",
            corClasse: "vermelho",
            marca: "",
            status: "resgatado",
            meuCadastro: false,
            usuarioSolicitou: true,
            notificacaoLida: true
        }
    ];


    // ==========================================
    // 4. MÉTODOS AUXILIARES
    // ==========================================
    function converterDataStr(textoData) {
        if (!textoData) return Date.now();
        const partes = textoData.split('/');
        return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
    }

    // Notificações para o USUÁRIO COMUM
    function gerarNotificacoes() {
        let notificacoes = [];
        
        itens.forEach(item => {
            let n = {
                id: item.id,
                idItem: item.id,
                foto: item.foto,
                dataHora: new Date(converterDataStr(item.data)),
                lida: item.notificacaoLida
            };

            if (item.meuCadastro) {
                if (item.status === 'aprovado') {
                    n.tipo = 'aprovado';
                    n.titulo = 'Cadastro Aprovado';
                    n.descricao = `O cadastro do item (${item.descricao}) foi aprovado e já está disponível no sistema.`;
                    notificacoes.push(n);
                } else if (item.status === 'reprovado') {
                    n.tipo = 'reprovado';
                    n.titulo = 'Cadastro Reprovado';
                    n.descricao = `O cadastro do item (${item.descricao}) foi reprovado.`;
                    n.motivo = item.motivoReprovacao || "Revise as informações.";
                    notificacoes.push(n);
                } else if (item.status === 'devolvido') {
                    n.tipo = 'outro';
                    n.titulo = 'Item Devolvido';
                    n.descricao = `O item (${item.descricao}) foi devolvido ao dono. Obrigado por cadastrar esse item no sistema!`;
                    notificacoes.push(n);
                }
            }

            if (item.usuarioSolicitou) {
                if (item.estadoSolicitacao === 'aprovado') {
                    n.tipo = 'aprovado';
                    n.titulo = 'Solicitação Aprovada';
                    n.descricao = `Sua solicitação de resgate do item (${item.descricao}) foi aprovada. Consulte as orientações para resgatar.`;
                    notificacoes.push(n);
                } else if (item.estadoSolicitacao === 'reprovado') {
                    n.tipo = 'reprovado';
                    n.titulo = 'Solicitação Reprovada';
                    n.descricao = `Sua solicitação de resgate do item (${item.descricao}) foi reprovada.`;
                    n.motivo = item.motivoReprovacao || "A administração não pôde confirmar a propriedade.";
                    notificacoes.push(n);
                } else if (item.status === 'resgatado') {
                    n.tipo = 'outro';
                    n.titulo = 'Resgate Concluído';
                    n.descricao = `Que bom! O seu item (${item.descricao}) foi resgatado.`;
                    notificacoes.push(n);
                }
            }
        });

        return notificacoes.sort((a, b) => b.dataHora - a.dataHora);
    }

    // Notificações para o ADMINISTRADOR
    function gerarNotificacoesAdmin() {
        let notificacoes = [];

        itens.forEach(item => {
            let n = {
                idItem: item.id,
                foto: item.foto,
                dataHora: new Date(converterDataStr(item.data))
            };

            // 1. Cadastros aguardando análise
            if (item.status === 'analise') {
                notificacoes.push({
                    ...n,
                    id: parseInt(`10${item.id}`),
                    tipo: 'cadastro', // Define a cor laranja e ícone de análise no JS
                    titulo: 'Novo Registo para Análise',
                    descricao: `O item (${item.descricao}) foi registado no sistema e aguarda a sua aprovação.`
                });
            }

            // 2. Solicitações de resgate aguardando análise
            if (item.estadoSolicitacao === 'analise') {
                notificacoes.push({
                    ...n,
                    id: parseInt(`20${item.id}`),
                    tipo: 'solicitacao', // Define a cor roxa e ícone de solicitado no JS
                    titulo: 'Nova Solicitação de Resgate',
                    descricao: `Um utilizador enviou evidências a solicitar o resgate do item (${item.descricao}).`
                });
            }

            // 3. Itens devolvidos com sucesso (Outros)
            if (item.status === 'devolvido' || item.status === 'resgatado') {
                notificacoes.push({
                    ...n,
                    id: parseInt(`30${item.id}`),
                    tipo: 'outro', // Define a cor azul clara e ícone de devolvido no JS
                    titulo: 'Item Devolvido aos Donos',
                    descricao: `Sucesso! O item (${item.descricao}) foi validado e entregue ao seu dono legítimo.`
                });
            }
        });

        return notificacoes.sort((a, b) => b.dataHora - a.dataHora);
    }

    return { itens, usuario, administrador, gerarNotificacoes, gerarNotificacoesAdmin, converterDataStr };
})();

window.obterIniciaisNome = function(nomeCompleto) {
    if (!nomeCompleto) return 'U';
    const partes = nomeCompleto.trim().split(' ').filter(Boolean);
    if (partes.length === 0) return 'U';
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};