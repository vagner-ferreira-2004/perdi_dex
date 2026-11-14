# Plano — CRUD de Usuário + Autenticação JWT (por diretório/arquivo)

> Versão reorganizada do plano original. Mesmas regras de negócio, descritas na ordem de
> implementação: banco → models → infraestrutura → validators → services → middlewares →
> controllers → routes → configuração final.
>
> **Critério de nomenclatura aplicado nesta versão:** em `helpers/`, `services/`,
> `middlewares/` e `validators/`, o nome do arquivo passa a ser o nome da função (ou
> schema) principal daquele módulo. Quando o arquivo mantém mais de uma função, a
> escolhida é sempre a ação de criação/fundamental (ex: `hashPassword` vence
> `verifyPassword`; `getMe` vence `updateMe`/`deleteMe`/`changePassword`). Quando duas
> funções representam features distintas (ex: registrar vs. autenticar), elas ficam em
> arquivos separados em vez de forçar uma a "vencer" a outra — foi o caso de
> `registerUser` e `loginUser`. `routes/`, `controllers/` e `models/` mantêm a convenção
> fixa do projeto (feature/entidade), pois não fazem sentido nomeados por uma única
> função.

## Objetivo

Implementar a primeira etapa completa de autenticação do backend:

* cadastro de usuários `common`;
* login;
* geração e validação de JWT;
* identificação do usuário autenticado;
* CRUD do próprio usuário;
* alteração de senha;
* integração com `profile` e `role`;
* proteção das rotas privadas.

A criação e o gerenciamento de usuários `admin` ficam **fora deste plano**.

---

## 0. Convenções aplicadas neste plano

| Diretório      | Padrão de arquivo |
| -------------- | ------------------ |
| `routes/`      | minúsculo, por feature |
| `controllers/` | minúsculo, por feature |
| `services/`    | PascalCase, nome da função principal |
| `validators/`  | PascalCase, nome do schema principal |
| `helpers/`     | PascalCase, nome da função principal |
| `middlewares/` | PascalCase, nome da função principal |
| `models/`      | PascalCase, nome da entidade |

Funções → `camelCase`. Variáveis → `snake_case`. Identificadores de código sempre em inglês.

---

## 1. `database/`

### `database/migrations/` (Alembic)

Criar uma nova migration cobrindo:

* criação da tabela `profile` (`id_profile`, `name`);
* criação da tabela `role` (`id_role`, `name`);
* alteração da tabela `user`, adicionando:
  * `password_hash` (`NOT NULL`)
  * `id_profile` (`NOT NULL`, FK → `profile.id_profile`)
  * `role_id` (`NOT NULL`, FK → `role.id_role`)

Regras:

* não editar migrations já aplicadas/compartilhadas — sempre uma nova revisão;
* a migration deve manter compatibilidade com os dados já existentes (ex: usuário de seed atual).

### `database/seeds/seed.py`

* inserir os `role` necessários: `common`, `admin`;
* inserir os `profile` necessários: `student`, `professor`, `staff`;
* atualizar o `Development User` existente para possuir `password_hash`, `id_profile` e `role_id` válidos.

### `database/Connection.py`

Nenhuma mudança estrutural nesta etapa — já resolve engine/session/checkDbConnection. Os `services` desta etapa vão consumir a `SessionLocal` já existente.

---

## 2. `models/`

### `models/User.py` (editar o existente)

Adicionar campos:

```text
password_hash   -> NOT NULL
id_profile      -> NOT NULL, FK -> Profile
role_id         -> NOT NULL, FK -> Role
```

Adicionar os relacionamentos SQLAlchemy com `Profile` e `Role`.

A tabela **não** deve possuir `password` nem `confirm_password` em nenhum momento.

### `models/Profile.py` (novo)

```text
id_profile  -> PK
name        -> NOT NULL, UNIQUE   (student, professor, staff)
```

### `models/Role.py` (novo)

```text
id_role  -> PK
name     -> NOT NULL, UNIQUE   (common, admin)
```

---

## 3. `helpers/`

Camada de infraestrutura pura — sem regra de negócio, sem acesso a banco.

### `helpers/HashPassword.py`

Funções:

* `hashPassword(password)` → gera `password_hash` **(função principal do arquivo)**;
* `verifyPassword(password, password_hash)` → retorna `True`/`False`.

Usar uma biblioteca de hashing apropriada (ex: `bcrypt` ou `passlib`). Nunca implementar hashing manualmente.

### `helpers/GenerateToken.py`

Funções:

* `generateToken(payload, expires_in)` → cria o JWT assinado **(função principal do arquivo)**;
* `decodeToken(token)` → valida assinatura e expiração, retorna o payload ou lança erro.

Payload mínimo:

```json
{ "sub": "<id_user>", "role": "<role_name>", "exp": "..." }
```

Nunca incluir dados sensíveis (senha, e-mail, cpf) no payload.

---

## 4. `validators/` (Pydantic, organizado por feature)

### `validators/RegisterSchema.py`

Cobre a feature de autenticação/sessão:

* `RegisterSchema` → `name`, `cpf`, `phone`, `email`, `rgm` (opcional), `password`, `id_profile`. **(schema principal do arquivo)**. **Não aceita** `id_user`, `password_hash`, `role_id`.
* `LoginSchema` → `email`, `password`.
* `ChangePasswordSchema` → `current_password`, `new_password`.

Valida apenas formato/estrutura: tipo, tamanho, formato de e-mail/CPF/telefone/RGM, requisitos mínimos de senha. Não decide nada que dependa do banco.

### `validators/UpdateUserSchema.py`

Cobre a feature de CRUD do próprio usuário (fora do escopo de sessão):

* `UpdateUserSchema` → apenas os campos editáveis via `PATCH /users/me`: `name`, `phone`, `email`. Não aceita `id_user`, `password_hash`, `role_id`, `id_profile`/`rgm` diretamente (mudanças nesses campos, se permitidas futuramente, passam por regra própria no service).

---

## 5. `services/`

### `services/RegisterUser.py`

`registerUser(data)` **(função única do arquivo)**:

1. verificar se `email` já existe → se sim, erro de conflito;
2. verificar se `cpf` já existe → se sim, erro de conflito;
3. verificar se `id_profile` existe;
4. aplicar regra do RGM: `profile = student` → `rgm` obrigatório; caso contrário, pode ser `NULL`;
5. se `rgm` informado, verificar se já existe;
6. gerar `password_hash` via `helpers/HashPassword`;
7. definir `role_id` como `common` (nunca aceitar `role_id` vindo do cliente);
8. persistir o `User`.

### `services/LoginUser.py`

`loginUser(data)` **(função única do arquivo)**:

1. buscar usuário por `email`;
2. se não existir → erro de credenciais inválidas;
3. verificar senha via `helpers/HashPassword.verifyPassword`;
4. se inválida → erro de credenciais inválidas;
5. gerar JWT via `helpers/GenerateToken.generateToken`;
6. retornar `access_token` + `token_type`.

### `services/GetMe.py`

`getMe(user_id)` **(função principal do arquivo)** → busca o usuário autenticado, nunca retorna `password_hash`.

* `updateMe(user_id, data)` → aplica apenas os campos permitidos (`UpdateUserSchema`); garante que a alteração não quebre regras do domínio (ex: profile/RGM).
* `deleteMe(user_id)` → executa a estratégia definida (soft delete ou exclusão física — decisão ainda em aberto, mas a função já deve existir isolada para facilitar a troca futura).
* `changePassword(user_id, data)`:
  1. verificar `current_password` contra o `password_hash` salvo;
  2. se inválida → erro;
  3. gerar novo `password_hash`;
  4. persistir.

### `services/__init__.py`

Agregador — importa `RegisterUser` (com `registerUser`), `LoginUser` (com `loginUser`) e `GetMe` (com `getMe`/`updateMe`/`deleteMe`/`changePassword`) e os expõe para os `controllers`.

---

## 6. `middlewares/`

### `middlewares/RequireAuth.py`

`requireAuth()` **(função principal do arquivo)**:

1. extrair o token do header `Authorization: Bearer <token>`;
2. se ausente → `401`;
3. validar o JWT via `helpers/GenerateToken.decodeToken`;
4. se inválido/expirado → `401`;
5. extrair `user_id` do payload e anexar ao contexto da request (ex: `g.user_id` no Flask).

`requireRole(role_name)`:

1. assume que `requireAuth()` já rodou;
2. compara a role do usuário autenticado com `role_name`;
3. se não corresponder → `403`.

---

## 7. `controllers/`

### `controllers/auth.py`

* `register()` → lê o body, roda `validators/RegisterSchema.RegisterSchema`, chama `services/RegisterUser.registerUser`, retorna `201` ou erro (`400`/`409`).
* `login()` → lê o body, roda `validators/RegisterSchema.LoginSchema`, chama `services/LoginUser.loginUser`, retorna `200` com o token ou `401`.

### `controllers/user.py`

* `getMe()` → obtém `user_id` do contexto (setado pelo middleware), chama `services/GetMe.getMe`.
* `updateMe()` → roda `validators/UpdateUserSchema.UpdateUserSchema`, chama `services/GetMe.updateMe`.
* `deleteMe()` → chama `services/GetMe.deleteMe`.
* `changePassword()` → roda `validators/RegisterSchema.ChangePasswordSchema`, chama `services/GetMe.changePassword`.

Nenhum controller acessa `models`/banco diretamente — sempre via `services`.

---

## 8. `routes/`

### `routes/auth.py` (novo)

```text
POST /auth/register  -> controllers.auth.register   (sem autenticação)
POST /auth/login     -> controllers.auth.login       (sem autenticação)
```

### `routes/user.py` (novo)

```text
GET    /users/me           -> controllers.user.getMe          (requireAuth)
PATCH  /users/me           -> controllers.user.updateMe       (requireAuth)
DELETE /users/me           -> controllers.user.deleteMe       (requireAuth)
PATCH  /users/me/password  -> controllers.user.changePassword (requireAuth)
```

### `routes/__init__.py` (editar o existente)

Registrar os dois novos Blueprints (`auth_bp`, `user_bp`) junto dos demais já existentes — nenhuma mudança é necessária em `App.py` além disso, pois `registerRoutes(app)` já centraliza esse registro.

---

## 9. Configuração (`.env` / `App.py`)

Adicionar ao `.env` (e `.env.exemple`):

```text
JWT_SECRET_KEY=...
JWT_EXPIRATION_MINUTES=...
```

Carregar essas variáveis onde `helpers/GenerateToken.py` for instanciado/configurado. `App.py` e `server.py` não precisam de lógica nova além de garantir que o `.env` seja carregado antes das rotas subirem — o que já acontece no fluxo atual.

---

## 10. Fluxo final

```text
POST /auth/register
        ↓
routes/auth.py
        ↓
controllers/auth.py
        ↓
validators/RegisterSchema.py (RegisterSchema)
        ↓
services/RegisterUser.py (registerUser)
        ↓
role = common
        ↓
models/User.py
        ↓
MySQL
```

```text
POST /auth/login
        ↓
routes/auth.py
        ↓
controllers/auth.py
        ↓
validators/RegisterSchema.py (LoginSchema)
        ↓
services/LoginUser.py (loginUser)
        ↓
helpers/HashPassword.py (verifyPassword)
        ↓
helpers/GenerateToken.py (generateToken)
        ↓
JWT
```

```text
Request protegida
       ↓
middlewares/RequireAuth.py -> requireAuth()
       ↓
JWT válido? --não--> 401
       ↓ sim
requireRole() (quando aplicável) --sem permissão--> 403
       ↓
routes/*.py
       ↓
controllers/*.py
       ↓
services/*.py
       ↓
Database
```

---

## 11. Tratamento de erros (transversal)

```text
Cadastro:        201 criado | 400 dados inválidos | 409 email/cpf/rgm duplicado
Login:           200 ok     | 401 credenciais inválidas
Autenticação:    401 JWT ausente/inválido/expirado
Autorização:     403 autenticado sem permissão
```

---

## 12. Testes obrigatórios (transversal)

* **Cadastro**: student com/sem RGM, professor/staff sem RGM, email/cpf/rgm duplicado, profile inexistente, senha inválida, tentativa de enviar `role_id = admin`.
* **Login**: credenciais corretas, email inexistente, senha incorreta, geração de JWT.
* **JWT**: token válido, expirado, inválido, ausente.
* **CRUD**: `GET/PATCH/DELETE /users/me`, alteração de senha, tentativa de alterar `role`/`password_hash`.
* **Autorização**: `common` em rota comum, `common` em rota admin (403), sem JWT (401), JWT inválido (401).

---

## 13. Fora deste plano

* criação/gerenciamento de `admin`;
* CRUD administrativo de usuários (`GET /users`, `PATCH /users/{id}`, etc.);
* sistema de `permission`/`role_permission`;
* recuperação de senha por e-mail;
* refresh token;
* confirmação de e-mail.

A estrutura atual deve permitir adicionar esses recursos depois sem refazer a arquitetura.