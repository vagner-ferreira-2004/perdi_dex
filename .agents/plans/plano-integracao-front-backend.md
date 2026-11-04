# Diagnóstico e plano de integração Frontend–Backend

## Objetivo e escopo

Este documento registra o estado observado do front e do backend e propõe uma ordem de
implementação para tornar os fluxos da interface persistentes e funcionais. A auditoria
não altera o comportamento nem o código da aplicação.

## Resumo executivo

- O backend já oferece autenticação/cadastro, leitura e atualização de parte do perfil,
  alteração de senha e operações básicas para itens encontrados.
- O frontend ainda não consome essas APIs: não há chamadas `fetch`, `XMLHttpRequest` ou
  `axios` nos scripts da aplicação.
- As telas e ações de negócio usam `BancoDeDados` em memória, com usuário, administrador,
  itens e notificações fictícios. Mudanças feitas nessas telas não persistem entre
  carregamentos e não chegam ao backend.
- A interface de itens e os contratos da API não estão alinhados (nomes, formatos,
  categorias, locais, estados e formato de envio da foto).
- Os fluxos de moderação, solicitação de resgate, notificações, gestão administrativa,
  métricas e exclusão/recuperação de conta não possuem APIs correspondentes.
- Algumas telas que a navegação promete estão vazias ou praticamente vazias; portanto,
  a implementação futura inclui trabalho de frontend, não apenas integração.

## Inventário: o que já existe

### Backend

| Domínio | Implementado hoje | Limites observados |
|---|---|---|
| Autenticação | `POST /auth/register`, `POST /auth/login`, JWT e limitação de requisições | Ainda sem confirmação/recuperação de senha e sem integração com os formulários |
| Perfil próprio | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password` | Atualização cobre nome, telefone e e-mail; não há exclusão de conta |
| Itens encontrados | `POST /objects-found`, listagem paginada, detalhe, alteração de status/data e leitura de foto | Listagem e detalhe exigem JWT; edição completa, exclusão e fluxo de resgate/moderação não existem |
| Autorização | Middleware JWT; helper de verificação de papel disponível | Não há rotas administrativas registradas nem uso de autorização admin nas rotas de itens |
| Dados de domínio | Modelos de usuário, perfil, papel, categoria, local, item, características, foto e retirada | `Pickup` existe como modelo/tabela, mas não possui serviços, validação ou rotas |

### Frontend

- Landing page, conteúdo institucional/termos/privacidade, tema, navegação e componentes
  visuais de busca, cards, tabelas, filtros, modais e gráficos estão montados.
- Existem formulários de login/cadastro, cadastro de item, configurações e interfaces de
  listas, notificações e dashboards.
- `BancoDeDados` fornece dados fictícios e funções locais para gerar notificações.
- Busca, filtros, ordenação, alteração/exclusão de item, solicitação de resgate, leitura/
  exclusão de notificações e edição de perfil operam sobre esses dados locais.
- O script de cadastro de item exibe sucesso e limpa o formulário sem enviar nada ao
  servidor.
- O tema é uma preferência local legítima; não precisa de API. Preferências de
  notificações, ao contrário, só exibem um toast e não são salvas.

## Lacunas e incompatibilidades por fluxo

| Fluxo da interface | Situação do backend | Trabalho necessário |
|---|---|---|
| Login e cadastro | APIs existem | Ligar formulários às APIs, mostrar erros do servidor, persistir a sessão de forma definida e direcionar o usuário; converter `telefone`/`senha`/perfil para `phone`/`password`/`id_profile`; enviar CPF apenas com dígitos; conferir senha e atender mínimo de 8 caracteres. O seletor atual omite professor e usa valores textuais, enquanto a API espera ID de perfil. |
| Sessão e autorização das páginas | JWT existe e as rotas privadas já o exigem | Definir estratégia segura de armazenamento e expiração, bootstrap do usuário atual, logout e proteção/redirecionamento de páginas. Atualmente qualquer rota de interface pode ser aberta sem verificar sessão ou papel. |
| Configurações de perfil | Leitura e atualização parcial existem | Conectar `GET/PATCH /users/me` e a alteração de senha. O front também apresenta CPF e RGM, mas o backend não permite atualizá-los. A exclusão da conta não existe no backend. |
| Cadastro de item encontrado | `POST /objects-found` existe | Adaptar o formulário para enviar `multipart/form-data` com arquivo no campo `photo`; enviar `id_category`, `id_location`, `found_date`, `color`, `brand` e `description`. Hoje os campos usam rótulos/nomes diferentes, a foto é mantida como Base64, local é texto livre e marca é opcional, mas o schema exige marca. |
| Categorias e locais | Existem modelos e dados seed, mas não endpoints de consulta | Criar endpoints de catálogo e alinhar rótulos/IDs. Os nomes seed estão em inglês e não correspondem diretamente às opções em português do formulário; locais disponíveis também não são apresentados pelo front. |
| Itens do sistema / busca pública | Existe listagem, porém exige JWT | Definir quais itens publicados podem ser vistos sem login e oferecer uma rota pública somente leitura, ou exigir login de maneira consistente com a página pública atual. A listagem do backend filtra status/categoria/local; a interface também espera busca textual, cor, faixa de datas, ordenação e estado de visualização. |
| Lista “Meus itens” e detalhe | Lista e detalhe básicos existem, mas a listagem atual é geral e protegida | Criar filtro inequívoco por proprietário e completar dados serializados para exibição (nomes de categoria/local, URL da foto e atributos). Atualmente a API retorna IDs e a interface espera nomes, imagem e propriedades com outra estrutura. |
| Edição e exclusão de item | Não existem rotas/serviços correspondentes | Definir e implementar atualização e exclusão, com autorização por proprietário e política de exclusão para itens já solicitados/devolvidos. O front hoje apenas altera/apaga objetos do array local. |
| Estados e revisão administrativa | API permite `Pendente`, `Encontrado` e `Devolvido`; atualização atual só deixa o proprietário alterar | Definir uma máquina de estados única e transições permitidas. A UI usa `analise`, `aprovado`, `reprovado`, `solicitado`, `resgatado` e `devolvido`. Faltam aprovação/reprovação com motivo e transições protegidas para admin. |
| Solicitar, cancelar e contestar resgate | Não há rotas/serviços; `Pickup` é apenas estrutura de dados | Especificar o que significa contestação e quais dados/comprovantes são exigidos. Implementar criação/cancelamento/análise/decisão da solicitação e conclusão da retirada, com autorização e histórico. |
| Notificações | Não há modelo, persistência nem API | Criar notificações persistentes por usuário/admin, filtros, paginação, marcar uma/todas como lidas, exclusão e contagem para badges. Definir se são geradas por eventos de domínio ou por consulta. |
| Dashboards e gráficos | Não há endpoints de agregação | Substituir contagens/gráficos fixos por dados da API, com escopo de usuário comum e escopo administrativo, período e estados acordados. |
| Gestão de usuários/admin | A tela `usuarios.html` não apresenta conteúdo funcional e não há API de listagem/moderação | Completar a tela e definir endpoints administrativos de listagem/detalhe/ações, protegidos por papel admin. O papel e o helper de autorização existentes não constituem, por si só, uma funcionalidade de administração. |
| Recuperar senha | A interface mostra “Esqueceu a senha?” sem fluxo funcional | Decidir provedor e política de envio/token e implementar solicitação, token temporário e redefinição; não existe endpoint hoje. |
| Ajuda | `ajuda.html` está vazia | Criar o conteúdo e decidir se é conteúdo estático/FAQ ou atendimento com persistência. Não há backend de suporte. |
| Preferências | Tema funciona localmente; preferências de e-mail/status/devolução não persistem | Manter tema no navegador e, se as preferências de notificação forem requisito, armazená-las por usuário/admin e aplicá-las ao envio. |

## Pontos importantes para compatibilidade

1. A listagem e o detalhe de itens exigem autenticação, apesar de existir busca pública
   sem login na interface.
2. O formulário de item não consegue formar uma requisição válida conforme o contrato
   atual: usa categoria em texto e um campo `categoria` repetido, local livre, data
   `dd/mm/aaaa` e imagem Base64; o backend espera IDs, data ISO e upload de arquivo.
3. As categorias seed (`Cell Phone`, `Wallet`, etc.) não cobrem/alimentam diretamente as
   opções de UI (`Eletrônicos`, `Bolsas`, `Outros`, etc.). A tabela `location` não é
   consultável pelo frontend.
4. Os estados são semanticamente diferentes entre os lados; mapear strings sem definir
   transições pode permitir aprovação/reprovação/resgate inválidos.
5. A interface de admin possui links para páginas incompletas e apresenta valores de
   exemplo. `analises.html`, `itens-perdidos.html` e `usuarios.html` têm conteúdo
   funcional ausente; `ajuda.html` também está vazia.
6. O plano existente `plano-login-register.md` descreve autenticação e perfil como
   trabalho futuro. Na implementação atual, cadastro/login, leitura/atualização de
   perfil e alteração de senha já existem no backend; exclusão de usuário e parte do
   escopo daquele plano ainda não existem. Este documento considera o código atual como
   fonte do estado, não o status histórico daquele plano.

## Plano de execução — roteiro de implementação

Este roteiro foi organizado para executar e validar cada fatia antes de avançar. A ordem
é deliberada: primeiro se decide o comportamento; depois se estabiliza o contrato e a
integração; só então as telas deixam de usar dados fictícios. Não serão removidos os
mocks de uma área antes de seu fluxo real passar pelos critérios de aceite.

### Como vou executar

- Implementar uma fatia de ponta a ponta (banco/API/interface/testes) por vez, sem abrir
  várias áreas de negócio simultaneamente.
- Antes de cada etapa, conferir novamente o estado do worktree e ler os arquivos que serão
  alterados; preservar mudanças existentes de terceiros.
- Para cada endpoint novo ou alterado, incluir teste de sucesso, validação, autenticação e
  autorização aplicável antes de conectar a interface.
- Não exibir confirmação de sucesso até a API responder com sucesso. Em falha, manter os
  dados do formulário e apresentar mensagem útil.
- Manter tema, animações e preferências estritamente locais que não exijam sincronização;
  remover `BancoDeDados` por fluxo, não de uma vez.
- Ao concluir uma etapa, rodar os testes mais próximos, conferir `git diff --check` e
  verificar manualmente os fluxos afetados. Registrar decisões de domínio que alterem o
  escopo antes de codificá-las.
- Nenhum commit será criado sem solicitação explícita.

### Critérios transversais de pronto

Uma funcionalidade só será considerada concluída quando:

1. Sua regra de negócio estiver descrita e aplicada no backend (não apenas escondida no
   front).
2. O contrato de request/response e erros estiver validado por teste.
3. O front apresentar carregamento, sucesso, estado vazio e erro sem inventar dados.
4. A operação continuar correta após recarregar a página e iniciar outra sessão.
5. IDs e dados privados forem autorizados no servidor; esconder botão não conta como
   controle de acesso.
6. Documentação pertinente e links de navegação estiverem atualizados.

### Etapa 0 — Decisões de produto e contrato (bloqueio antes de codificar fluxos)

**Objetivo:** impedir que a integração consolide estados ou permissões incompatíveis.

**Decisões que precisam ser confirmadas:**

- **Acesso à busca — decidido:** visitantes podem consultar somente itens publicados/
  aprovados; campos públicos devem excluir dados pessoais e evidências de resgate.
- **Sessão — decidido:** preferir cookie `HttpOnly` seguro ao token em `sessionStorage`.
  Frontend e API serão publicados na mesma origem. Usar cookie `SameSite=Strict`, CORS
  desnecessário nessa topologia e proteção CSRF por token sincronizado.
- **Ciclo do item — direção aprovada:** pendente de revisão → publicado → solicitação
  pendente → resgate aprovado/recusado → devolvido. Antes de codificar, detalhar estados
  terminais, reprovação, concorrência e ator autorizado em cada transição.
- **Contestar — decidido:** abrir disputa de propriedade com envio de evidências; formato,
  limites, visibilidade e retenção das evidências ainda precisam de contrato.
- **Exclusão — decidido:** desativação lógica e preservação do histórico operacional para
  contas e itens. Definir regras de anonimização/retensão de dados pessoais.
- **Conta:** definir se estudante, professor e funcionário podem alterar perfil, CPF ou
  RGM; definir fluxo de recuperação de senha e canal de envio.
- **Administração:** definir se haverá um único papel `admin` ou papéis/permissões
  diferentes.
- **Preferências:** definir notificações e canais; tema continua local por padrão.

**Tarefas de execução:**

- Mapear cada resposta para uma tabela de papéis × ações e uma máquina de estados.
- Especificar um exemplo de request e response por operação, incluindo status HTTP,
  paginação e estrutura de erros.
- Definir como frontend e backend serão publicados (mesma origem ou origens distintas)
  para decidir CORS e a estratégia de sessão.

**Bloqueio:** busca pública, estratégia de sessão, direção do ciclo de item, contestação e
exclusão lógica foram decididas acima. Não implementar recuperação de senha, políticas de
anonimização, papéis administrativos adicionais nem detalhes de evidência/retirada sem as
respectivas respostas. Trabalho independente de testes, cliente HTTP e integração básica
de login pode avançar.

**Saída/aceite:** decisões registradas neste plano ou em contrato atualizado; matriz de
permissões e transições sem estados ambíguos.

### Etapa 1 — Contratos, testes-base e cliente HTTP

**Dependência:** Etapa 0 para URL de publicação, sessão e contratos de itens.

**Backend — sequência de tarefas:**

1. Identificar e adotar o runner de testes existente; a inspeção inicial não encontrou
   arquivos de teste. Se continuar sem runner, introduzir a estrutura mínima para testes
   de rotas e serviços, sem mexer na configuração de produção além do necessário.
2. Criar testes de regressão para login, cadastro, `/users/me` e rotas atuais de item,
   registrando comportamento presente antes de expandir contratos. Para autenticação por
   cookie, testar atributos do cookie, logout/expiração, CORS com credenciais e proteção
   CSRF.
3. Padronizar respostas de erro e serialização dos itens, sem expor CPF, tokens, hash de
   senha ou dados de retirada em respostas públicas.
4. Ajustar CORS ou documentar configuração same-origin, conforme decisão de publicação.

**Frontend — sequência de tarefas:**

1. Criar configuração de URL da API apropriada para o frontend estático, separada dos
   segredos do backend. Nenhum segredo de backend deve ser incluído no bundle estático.
2. Criar um cliente reutilizável (por exemplo, `src/js/global/api.js`) para JSON e upload
   `FormData`, cookie com `credentials: "include"`, token CSRF conforme contrato, parse de
   erros e resposta de `401`, sem duplicar `fetch` por página.
3. Criar utilitários comuns de feedback para formulário: estado de envio, limpeza de erros
   antigos, exibição de erro e restauração do botão em `finally`.
4. Testar URL, cabeçalhos, JSON, `FormData`, erros 4xx/5xx e falha de rede.

**Arquivos prováveis:** `backend/App.py`, `backend/requirements.txt` se faltar dependência
de teste, `backend/tests/` (nova estrutura se necessária), `frontend/src/js/global/api.js`
e `frontend/src/js/global/api-config.js` (nomes provisórios).

**Aceite:** chamadas reais autenticadas por cookie e upload conseguem ser feitas pelo
cliente compartilhado; erro de API não vira resposta vazia ou sucesso fictício.

### Etapa 2 — Cadastro, login, sessão e perfil

**Dependência:** Etapa 1; JWT será entregue e revogado via cookie `HttpOnly` com atributos
seguros e proteção CSRF definidos para a topologia final de publicação.

**Backend:**

1. Revisar validações atuais e adicionar testes de compatibilidade dos payloads, campos
   extras, senha curta, duplicidade e perfil/RGM.
2. Implementar apenas as operações de conta aprovadas na Etapa 0 (por exemplo, exclusão
   lógica ou recuperação); criar migration nova quando o modelo mudar.
3. Assegurar que serialização de perfil nunca inclua `password_hash` e que erros de
   credencial não distingam usuário inexistente de senha incorreta.

**Frontend:**

1. Adicionar controlador dos dois formulários em `pages/auth/index.html` e script
   correspondente: converter `senha` para `password`, telefone para `phone`, CPF para
   dígitos, validar confirmação e traduzir perfil para `id_profile` conforme catálogo
   acordado.
2. Implementar login, salvar/restaurar sessão segundo a decisão de segurança, buscar
   `/users/me` e redirecionar sem confiar em papel recebido somente do DOM.
3. Implementar logout, expiração/401 e guards nas páginas user/admin. Se o servidor
   estático não autorizar HTML, o guard é UX; todas as APIs continuam obrigadas a
   revalidar autorização.
4. Trocar os dados do menu e do dashboard pelos dados de `/users/me`; evitar usar os
   objetos `usuario`/`administrador` de `BancoDeDados`.
5. Conectar `configuracoes.js`: carregar valores da API, salvar apenas campos aceitos,
   alterar senha em request separado e manter formulário preenchido em caso de falha.
6. Tratar corretamente campos que hoje não são editáveis na API (CPF/RGM): desabilitar/
   explicar ou implementar regra aprovada, nunca fingir que foram salvos.
7. Conectar exclusão/recuperação apenas se aprovadas; até então, ocultar ação inoperante
   ou informar indisponibilidade sem afirmar exclusão concluída.

**Arquivos prováveis:** `backend/controllers/auth.py`, `backend/controllers/user.py`,
`backend/routes/user.py`, `backend/services/User/`, `backend/validators/`,
`frontend/pages/auth/index.html`, novo controlador de auth em `frontend/src/js/pages/`,
`frontend/src/js/components/menu.js`, `frontend/src/js/pages/dashboard.js` e
`frontend/src/js/pages/configuracoes.js`.

**Aceite:** cadastro e login persistem no banco; refresh da página mantém o estado
conforme política; conta comum não acessa páginas admin nem endpoints admin; alteração
de senha e perfil é refletida após nova consulta.

### Etapa 3 — Catálogos e contrato de itens

**Dependência:** Etapa 0 e cliente da Etapa 1.

**Backend:**

1. Criar leitura de categorias e locais com IDs, nomes de exibição e atributos estritamente
   necessários; decidir quais podem ser públicos.
2. Rever seeds e migrations para que categorias/localizações correspondam ao vocabulário
   real da instituição. Não alterar migration já aplicada; criar revisão compatível.
3. Definir o DTO comum do item para cards, detalhes, dashboard e notificações; serializar
   categoria/local como dados de exibição e foto por URL estável.
4. Criar endpoint “meus itens” que derive o usuário do JWT (não aceite `id_user` arbitrário
   como autoridade) e completar filtros/paginação necessários.
5. Aplicar regra de visibilidade à listagem e detalhe públicos; confirmar que detalhe não
   vaza dados do dono, solicitante ou comprovantes.
6. Criar testes de escopo (usuário A não consulta dados privados de B), filtros e
   serialização.

**Frontend:**

1. Substituir opções estáticas de categoria/cor/local em `cadastro-item.html` por dados
   carregados da API, preservando IDs em campos ocultos.
2. Criar adaptador de DTO para os componentes de `itens.js`, `search.js` e
   `listagem-itens.js`; fazer `BancoDeDados.itens` deixar de ser a fonte de listagem.
3. Integrar cards e detalhe para carregamento, vazio, falha e paginação; manter busca,
   filtros e ordenação definidos pela API (ou documentar quais são locais em memória).
4. Aplicar acesso público/privado de acordo com a Etapa 0, incluindo CTA de login quando
   resgate exigir autenticação.

**Arquivos prováveis:** novos módulos em `backend/services/Catalog/` e `backend/routes/`,
`backend/models/Category.py`, `Location.py`, seeds/migration; `frontend/pages/user/`,
`frontend/components/busca-itens.html`, `frontend/src/js/components/itens.js`,
`search.js` e `listagem-itens.js`.

**Aceite:** busca pública e “Meus itens” têm escopo correto, nomes visíveis e paginação;
não dependem de amostras locais para renderizar.

### Etapa 4 — Cadastro, edição e exclusão de itens

**Dependência:** contrato/DTO e catálogos da Etapa 3.

**Backend:**

1. Ajustar schema para regra aprovada de marca opcional, tamanho da descrição e datas;
   manter `extra="forbid"` e validação de domínio.
2. Substituir armazenamento local por Cloudinary. Ler `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` somente do ambiente/backend `.env`;
   nunca expor, registrar ou incluir esses valores em arquivos versionados ou código do
   navegador. Usar SDK oficial no backend, configurar dependência e exemplo de variáveis
   sem valores secretos, validar arquivo no servidor (presença, formato real, tamanho),
   persistir `secure_url` e `public_id`, e apagar o recurso remoto se a transação do banco
   falhar.
3. Implementar remoção lógica de itens e edição conforme política decidida, preservando
   histórico de retirada.
4. Remover ou restringir atualização livre de status/data pelo proprietário quando
   contrariar a máquina de estados aprovada.
5. Testar upload inválido/grande, falha do provedor, rollback com cleanup remoto,
   usuário não dono, não encontrado e
   item em estado que não permite exclusão/edição.

**Frontend:**

1. Corrigir campos HTML com `name` ausente/duplicado em `cadastro-item.html`; trocar o
   Base64 por arquivo enviado no campo `photo` e data por ISO no payload. Renderizar a
   imagem pelo `secure_url` devolvido pelo backend; o navegador não recebe credenciais
   Cloudinary privilegiadas.
2. Conectar `cadastro-item.js` ao cliente HTTP; só limpar formulário após resposta 201.
3. Conectar edição/exclusão em `listagem-itens.js` e `modais-itens.js`; remover mutação
   local como fonte de verdade e recarregar/reconciliar a lista após sucesso.
4. Desabilitar ações durante request; erro preserva formulário e dados; exibir status
   retornado pelo backend.

**Aceite:** criar, editar e excluir conforme regras segue correto após reload e nas
sessões; falhas de upload/servidor não exibem toast de sucesso.

### Etapa 5 — Moderação administrativa e ciclo de resgate

**Dependência:** máquina de estados aprovada e CRUD de item da Etapa 4.

**Backend:**

1. Criar serviço único para validar transições e registrar ator, timestamp, decisão e
   motivo; toda rota administrativa usa JWT mais `requireRole("admin")`.
2. Implementar fila de análise e operações de aprovar/reprovar com motivo; não reutilizar
   endpoint de alteração de status do proprietário.
3. Implementar criação/cancelamento/análise/decisão de resgate e registro de retirada,
   conforme campos/evidências aprovados.
4. Impedir operações duplicadas e corrida de duas solicitações concorrentes com
   restrições/locking/transação adequada.
5. Implementar paginação/filtros administrativos e testes para cada transição positiva e
   proibida, incluindo 401, 403 e usuário sem permissão sobre o objeto.

**Frontend:**

1. Construir conteúdo de `admin/analises.html` e `admin/itens-perdidos.html` com a mesma
   lista/detalhe base, mas ações e escopo definidos pela API.
2. Ligar botões e modais existentes de revisão/resgate em `modais-itens.js` a endpoints;
   remover callbacks que só mudam estado do objeto em memória.
3. Criar formulário de justificativa e exibir status/motivo reais ao usuário.
4. Completar navegação e condicionar ações por papel para UX, mantendo o controle efetivo
   no servidor.

**Aceite:** cada transição tem ator autorizado, resultado persistido, histórico consultável
e notificação/evento produzido conforme contrato; chamadas forjadas são rejeitadas.

### Etapa 6 — Usuários administrativos e notificações

**Dependência:** autorização admin da Etapa 5; requisitos de notificações definidos na
Etapa 0.

**Backend:**

1. Criar endpoints administrativos de listagem/detalhe e ações de usuário aprovadas,
   protegendo dados pessoais por papel e finalidade.
2. Criar entidade/migration/serviço de notificação com destinatário, tipo, referência,
   timestamps, leitura e exclusão/arquivamento segundo política.
3. Integrar criação de notificações às transições de item/resgate; uma repetição de request
   não deve gerar eventos duplicados.
4. Expor lista paginada, filtros, contagem não lida, marcar uma/todas como lidas e ação de
   exclusão conforme autorização.
5. Testar isolamento entre usuários, escopo admin, filtros, paginação e duplicidade.

**Frontend:**

1. Completar `admin/usuarios.html` com carregamento, busca, paginação, vazio e erros.
2. Reescrever `notificacoes.js` para carregar/mutar via API, mantendo filtros, ordenação,
   paginação e modal existentes; retirar `gerarNotificacoes()` e sincronização em memória.
3. Fazer badge global refletir API e recarregar estado após mudança de página/sessão.
4. Exibir motivo e links para o item de destino usando IDs reais e rotas existentes.

**Aceite:** ações de leitura/exclusão persistem entre sessões e um usuário nunca lê/altera
notificações de outro.

### Etapa 7 — Dashboards, preferências e telas de suporte

**Dependência:** dados reais de itens e eventos disponíveis nas Etapas 4–6.

1. Implementar endpoints agregados com escopo de usuário/admin e período; não enviar
   conjuntos completos de itens para calcular métricas no browser.
2. Substituir números estáticos em `pages/user/index.html` e `pages/admin/index.html` e
   atualizar `dashboard.js`, `graficos.js` e `graficos-admin.js` para consumir respostas.
3. Validar estados sem dados, intervalo sem resultados e datas/timezone.
4. Persistir preferências de notificação somente se aprovadas; tema permanece local salvo
   nova decisão.
5. Completar `user/ajuda.html`: conteúdo local estático se FAQ; implementar API somente se
   atendimento/tickets forem confirmados como requisito.
6. Revisar links que apontam para telas vazias, arquivos inexistentes ou IDs de filtro
   incompatíveis; validar navegação a partir das notificações e dashboards.

**Aceite:** números dos dashboards reconciliam com consultas/filtros do backend para cada
papel e telas vazias têm comportamento definido.

### Etapa 8 — Regressão integrada e preparação de publicação

**Dependência:** fluxos selecionados para primeira entrega concluídos.

1. Completar matriz de testes backend: contratos, validação, erros, JWT, papéis,
   autorização por recurso, upload e transições.
2. Adicionar testes de frontend para cliente HTTP e controladores críticos; se não houver
   infraestrutura de navegador, escolher ferramenta mínima apenas quando a suíte não
   conseguir validar os fluxos sem ela.
3. Validar migration em banco limpo e caminho de upgrade em banco com dados; seeds
   repetidos devem permanecer idempotentes.
4. Executar ponta a ponta com ao menos usuário comum e admin: cadastro/login, consulta,
   cadastro de item, revisão, solicitação/retirada, notificações e dashboards.
5. Conferir responsividade, foco/teclado, mensagens, console do navegador, URLs de foto,
   uploads, CORS, limites, configuração e logs sem dados sensíveis.
6. Retirar código de mock de cada tela somente após seu fluxo ter aceite; manter fixtures
   isoladas em testes, nunca como fallback de produção.
7. Atualizar README e documentação de execução/API; registrar requisitos de configuração
   e procedimentos de migration/seed.

**Aceite final:** as ações visíveis funcionam ou estão explicitamente desabilitadas como
fora do escopo; nenhuma ação de negócio simula sucesso localmente; testes, migrations e
fluxo integrado passam.

## Sequência crítica e entregas incrementais

1. **Entrega A:** decisões mínimas, contratos/testes-base, cliente HTTP e login/perfil.
2. **Entrega B:** catálogos, listagem pública/privada e busca com dados reais.
3. **Entrega C:** cadastro e gestão dos próprios itens persistente.
4. **Entrega D:** revisão administrativa, estados e ciclo de resgate.
5. **Entrega E:** usuários admin, notificações e dashboards.
6. **Entrega F:** regressão ponta a ponta, retirada dos mocks e documentação de publicação.

Cada entrega deve terminar com os critérios transversais de pronto. Se uma decisão de
produto atrasar, avançar apenas trabalho independente e manter a ação bloqueada/inoperante
de forma explícita; não substituir decisão ausente por estado fictício.

## Progresso da execução

Implementado nesta execução:

- Sessão em cookie `HttpOnly`, proteção CSRF, logout, consulta da sessão atual e bloqueio
  imediato de contas desativadas; o frontend passou a usar o cliente HTTP comum.
- Upload de imagens para Cloudinary com persistência do `public_id`, catálogos reais,
  listagem pública limitada a itens publicados e listagem autenticada/admin.
- Cadastro multipart, edição com retorno à análise quando um item publicado é alterado,
  desativação lógica de itens e revisão administrativa com motivo de reprovação.
- Desativação lógica de usuários, listagem administrativa com dados minimizados e
  notificações persistentes por destinatário para novos cadastros e decisões de revisão.
- Telas de cadastro, revisão, usuários, notificações, configurações e dashboards conectadas
  às APIs implementadas; a central de ajuda agora informa limites ainda existentes.
- Solicitação, cancelamento e revisão administrativa de resgates; confirmação pelo
  solicitante com senha atual, registro da devolução, notificações e histórico de pedidos.
- Contestação autenticada de itens devolvidos, com descrição obrigatória e até três
  evidências de imagem de 10 MB cada; lista segura de itens contestáveis para usuários
  autenticados, histórico próprio e fila administrativa para decisão.
- Testes backend de sessão, autorização, upload, revisão, usuários, notificações e novos
  contratos de resgate/contestação (27 testes passaram); mapeamentos SQLAlchemy,
  sintaxe JavaScript e geração SQL offline também foram verificados. A migration `0006`
  não foi aplicada ao banco real.

Ainda pendente para concluir o plano:

- Recuperação de senha foi explicitamente adiada. A política de retenção/anonimização de
  dados pessoais segue sem prazo definido; nenhuma eliminação automática foi implementada.
- Preferências persistentes de notificação, testes integrados em banco limpo/upgrade e
  validação ponta a ponta no navegador.
- Regra de contestação confirmada pelo usuário: uma decisão aceita reabre o item como
  `Encontrado`, para nova análise/solicitação de resgate.
