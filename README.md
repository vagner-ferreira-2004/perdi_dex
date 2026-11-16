# PerdiDex

O PerdiDex é um sistema de achados e perdidos voltado à comunidade da faculdade. A proposta é facilitar a divulgação de objetos encontrados no campus e ajudar a devolvê-los a estudantes, professores e funcionários, mantendo um registro das pessoas envolvidas no processo.

## Contexto e objetivo

O processo tradicional de achados e perdidos depende da procura manual do item no centro de achados e perdidos da faculdade, além de não ter um registro dos itens. O PerdiDex centraliza os registros para que qualquer pessoa possa consultar os itens publicados. Para cadastrar um objeto encontrado ou solicitar o resgate de um item, é necessário ter uma conta, assim, as ações ficam associadas a um usuário identificado.

O catálogo público não deve expor dados pessoais de quem cadastrou ou solicitou um item. Se houver dúvida sobre a propriedade, o contato entre as pessoas deve ocorrer por um fluxo controlado, sem divulgar informações privadas para visitantes.

## Pessoas envolvidas

- **Visitante:** consulta os itens publicados sem precisar entrar na conta.
- **Membro da faculdade:** estudante, professor ou funcionário que cria uma conta, cadastra objetos encontrados, solicita um resgate e acompanha suas ações.
- **Administrador:** analisa cadastros, solicitações de resgate e contestações, além de gerenciar usuários.

No sistema, o perfil institucional (estudante, professor ou funcionário) é diferente do papel de acesso. Usuários comuns têm o papel `common`; a administração usa `admin`.

## Fluxo principal

1. Uma pessoa encontra um objeto no campus e, autenticada, informa foto, categoria, características, local e data.
2. O cadastro começa como pendente e só aparece no catálogo público após análise administrativa.
3. Um visitante pode consultar os itens publicados. Para solicitar o resgate, precisa entrar ou criar uma conta.
4. A solicitação é analisada pela administração. Se aprovada, a pessoa solicitante confirma a retirada autenticando novamente com sua senha.
5. A confirmação registra a conclusão da solicitação e marca o item como devolvido.
6. Se outra pessoa acreditar ser a verdadeira proprietária após a devolução, pode abrir uma contestação com uma descrição e até três imagens de evidência. A administração analisa o caso.

## Requisitos do produto

### Funcionais

- **RF01 — Consultar itens:** permitir a navegação pública dos itens encontrados e publicados, com busca e filtros úteis, sem revelar dados pessoais.
- **RF02 — Criar conta e autenticar:** permitir cadastro de estudantes, professores e funcionários. O cadastro de estudante exige RGM; ações de cadastro e resgate exigem autenticação.
- **RF03 — Cadastrar objeto encontrado:** registrar foto, categoria, cor, marca ou indicação de marca desconhecida, descrição, local e data em que o objeto foi encontrado.
- **RF04 — Moderar cadastro:** permitir que a administração aprove ou rejeite cadastros, informando o motivo quando houver rejeição.
- **RF05 — Solicitar resgate:** associar cada solicitação a um usuário e a um item, evitar solicitações concorrentes ativas para o mesmo item e permitir o cancelamento enquanto pendente.
- **RF06 — Aprovar e concluir resgate:** registrar a decisão administrativa e a confirmação da retirada pelo usuário aprovado, incluindo datas e estados do processo. Se houver retirada contestada, oferecer ao responsável original um meio autorizado de contato com quem retirou o item.
- **RF07 — Tratar contestação de propriedade:** aceitar uma justificativa e evidências, encaminhar o caso para análise e registrar decisão e motivo. Uma contestação aceita deve tornar o item disponível novamente.
- **RF08 — Notificar envolvidos:** avisar usuários e administração sobre cadastros, solicitações, decisões, devoluções e contestações relevantes.
- **RF09 — Administrar o sistema:** permitir análise de itens, solicitações e contestações, além de consulta e desativação de usuários, com acesso restrito à administração.
- **RF10 — Consultar histórico próprio:** permitir que cada usuário acompanhe seus cadastros, solicitações, notificações e contestações sem acessar dados privados de outras pessoas.

### Não funcionais

- **RNF01 — Privacidade:** dados pessoais e informações de solicitantes devem ser visíveis somente a quem precisa deles para operar o processo.
- **RNF02 — Segurança:** validar os dados no servidor, proteger rotas por autenticação e papel, armazenar senhas como hash e proteger operações autenticadas contra CSRF.
- **RNF03 — Integridade e auditoria:** manter o vínculo entre item, usuário, decisão e datas. Impedir transições incompatíveis e preservar um histórico suficiente para resolver conflitos.
- **RNF04 — Usabilidade:** funcionar em telas móveis e desktop, comunicar estados e erros com clareza e oferecer busca por características relevantes do objeto.
- **RNF05 — Mídia:** validar o tipo e o tamanho de imagens antes de armazená-las. São aceitas imagens JPG, JPEG, PNG, WEBP e AVIF de até 10 MB.
- **RNF06 — Manutenibilidade:** manter regras de negócio no backend, contratos validados, migrations versionadas e testes de acesso e comportamento.


## Estados principais

- **Item:** `Pendente` → `Encontrado` ou `Reprovado`. Após a retirada confirmada, `Devolvido`. Uma contestação aceita pode retornar o item para `Encontrado`.
- **Solicitação de resgate:** `Pendente` → `Aprovado` ou `Reprovado`. Também pode ser `Cancelado` pelo solicitante enquanto pendente. Uma solicitação aprovada e confirmada passa a `Concluido`.
- **Contestação:** começa `Pendente` e termina `Resolvida`, com decisão `Aceita` ou `Recusada`.

## Arquitetura e organização

- `frontend/`: aplicação web estática em HTML, CSS e JavaScript, com páginas públicas, autenticação, área do usuário e área administrativa.
- `backend/`: API Flask em Python, com controllers, rotas, serviços, validações Pydantic e middleware de autenticação/autorização.
- `backend/models/` e `backend/database/`: modelos SQLAlchemy, conexão MySQL, seeds e migrations Alembic.
- `backend/helpers/images.py`: envio e remoção de imagens pelo Cloudinary.
- `backend/tests/`: testes de autenticação por cookie, CORS local, permissões, notificações, itens, resgates e imagens.
- `.agents/plans/`: notas e planos de desenvolvimento. Alguns registram estados anteriores da integração. Para o comportamento atual, considerar o código e os testes presentes como referência.

## Tecnologias

- **Frontend:** HTML, CSS e JavaScript sem framework de aplicação.
- **Backend:** Python, Flask, SQLAlchemy, Alembic e Pydantic.
- **Persistência:** MySQL.
- **Imagens:** Cloudinary.
- **Autenticação:** JWT em cookie, com proteção CSRF e controle de acesso por papel.

## Link de acesso ao site 
Este sistema atualmente está funcionando somente através de um server presente na máquina de um dos nossos integrantes, por isso, é preciso solicitar para nós a ativação do server para conseguir usar o site completamente.

https://perdidex.vercel.app
