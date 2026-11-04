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

## Plano de implementação recomendado

### Fase 0 — Fechar decisões de domínio e contratos

- Definir se a busca de itens será pública e quais estados/atributos podem ser expostos.
- Definir estados canônicos, responsáveis e transições: envio, revisão, publicação,
  reprovação, solicitação, aprovação/recusa de resgate e devolução.
- Definir conteúdo e evidências exigidas para solicitar/contestar/retirar um item.
- Definir se exclusão de conta/item é física ou lógica e quais dados precisam de histórico.
- Definir semântica de perfis (student/professor/staff), campos editáveis e política de
  recuperação de senha.
- Documentar payloads, respostas, erros, paginação, autenticação e autorização para cada
  endpoint antes de conectar as telas.

**Saída:** contrato versionado e critérios funcionais aprovados para cada fluxo.

### Fase 1 — Base de integração e APIs de domínio

- Criar um cliente HTTP único no frontend: URL base configurável por ambiente, JWT,
  parsing padronizado de respostas/erros, timeout e tratamento de sessão expirada.
- Configurar/documentar CORS ou same-origin conforme a forma real de publicação.
- Completar endpoints de categorias e locais e alinhar os dados seed às opções exibidas.
- Criar/ajustar listagem para público e usuário autenticado, busca/filtros/paginação e
  endpoint de “meus itens”.
- Harmonizar os serializers da API com uma representação de item documentada e estável.
- Adicionar validação dos contratos e testes de autorização desde o início.

**Aceite:** cliente consegue consultar catálogos e itens no formato que os componentes
consomem; respostas públicas não revelam dados privados e privadas exigem JWT.

### Fase 2 — Autenticação e conta

- Integrar cadastro/login aos endpoints existentes e converter os campos/formatações da UI.
- Implementar estado de sessão, carregamento de `/users/me`, logout e guarda de páginas
  comuns/admin.
- Ligar configurações a leitura/atualização de nome, e-mail e telefone, e alteração de
  senha; refletir os dados atualizados no menu/dashboard.
- Decidir e implementar exclusão de conta e recuperação de senha; não apresentar sucesso
  antes da confirmação do servidor.
- Tratar conflito de e-mail/CPF/RGM e erros de validação com mensagens acionáveis.

**Aceite:** cadastro/login em banco real, acesso protegido por papel, dados do perfil
persistem e mudanças de senha/conta retornam estados reais da API.

### Fase 3 — Busca, detalhe e cadastro de itens

- Implementar a visualização de catálogos, busca pública/autenticada, filtros, ordenação,
  paginação e detalhe usando API.
- Refazer o envio do cadastro para `multipart/form-data`, usar catálogo por ID e enviar
  data em formato ISO; alinhar marca opcional/obrigatória e limite/tipo/tamanho de foto.
- Exibir estados vazios, carregamento, validação e falha de rede.
- Implementar atualização/exclusão de item próprio e recarregar a lista após mutações.

**Aceite:** item cadastrado aparece após recarregar e pode ser encontrado/consultado
conforme visibilidade e permissões definidas; ações inválidas são bloqueadas pelo
servidor e pela interface.

### Fase 4 — Ciclo administrativo e resgate

- Completar as telas vazias de análise, itens e usuários; corrigir links de navegação que
  apontam para páginas inexistentes ou incompletas.
- Implementar endpoints administrativos com verificação explícita de papel, trilha de
  decisão e motivo de aprovação/reprovação.
- Implementar solicitação, cancelamento, contestação (se confirmada como requisito),
  aprovação/recusa e conclusão de retirada com dados/evidências protegidos.
- Aplicar máquina de estados e regras de concorrência para impedir solicitações duplicadas
  ou transições incompatíveis.

**Aceite:** admin não consegue ser substituído por alteração de dados no navegador;
somente transições autorizadas persistem e o usuário acompanha o resultado.

### Fase 5 — Notificações, preferências e métricas

- Persistir notificações vinculadas ao destinatário e eventos que as originam.
- Integrar filtros, paginação, leitura/exclusão e badges; manter estado coerente entre
  telas e dispositivos.
- Persistir preferências somente se confirmadas como requisito.
- Criar agregações para dashboards de usuário e admin e remover valores fixos/gráficos
  calculados com os exemplos locais.

**Aceite:** notificações e indicadores correspondem ao estado do banco e ao escopo correto
de cada papel.

### Fase 6 — Qualidade, segurança e publicação

- Cobrir backend com testes de serviços/rotas: sucesso, validação, não encontrado,
  conflito, autenticação, autorização e transições de estado.
- Cobrir frontend com testes de cliente HTTP, formulários, estados de erro/carregamento e
  fluxos principais; adicionar testes ponta a ponta para cadastro, busca, revisão e
  resgate.
- Validar migrações em banco novo e banco com dados existentes; revisar uploads,
  autorização por objeto, rate limits, dados pessoais, logs e configuração de produção.
- Executar fluxo completo em ambiente integrado, revisar links/telas responsivas e retirar
  os mocks apenas quando cada fluxo real estiver validado.

**Aceite final:** nenhuma ação de negócio reporta sucesso apenas localmente; testes e
migrações passam e todos os fluxos publicados possuem backend e autorização compatíveis.

## Priorização sugerida

1. Fase 0 e contrato de itens/cadastro/autorização.
2. Fases 1–3: integração, autenticação e fluxo básico de publicação/busca.
3. Fase 4: administração e resgate, necessários para fechar o ciclo do produto.
4. Fase 5: notificações e dashboards derivados dos eventos reais.
5. Fase 6 acompanha cada fase e conclui a validação antes da publicação.

## Fora do escopo desta etapa

- Não foram feitas alterações de código, migrações ou chamadas ao banco.
- Não foram escolhidas políticas de negócio ainda em aberto (estados finais, exclusão,
  evidências de resgate, recuperação de senha e visibilidade pública).
- Não foi assumido que os valores e interações da demonstração representam regras já
  aprovadas para produção.
