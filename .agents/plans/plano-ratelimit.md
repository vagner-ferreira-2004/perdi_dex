# Plano — Proteção de Rotas com Rate Limit

## Objetivo

Proteger as rotas do backend contra abuso (brute-force em login, spam de cadastro,
sobrecarga de endpoints) usando **Flask-Limiter**, mantendo a mesma separação de
responsabilidades já usada no restante do projeto.

Estratégia: limite **sempre por IP**, com dois perfis diferentes:

* **rotas sem autenticação** (`register`, `login`) → limite mais apertado, pois são o
  alvo natural de brute-force e spam;
* **rotas autenticadas** (`/users/me/*`) → limite mais folgado, já que vários usuários
  legítimos podem estar atrás do mesmo IP (ex: rede da faculdade) e o risco de abuso é
  menor após a autenticação.

---

## 0. Por que Flask-Limiter

* é a lib padrão para rate limiting em Flask, ativamente mantida;
* decorators simples por rota (`@limiter.limit("5 per minute")`);
* suporta múltiplos backends de armazenamento (memória, Redis, Memcache) — importante
  porque armazenamento em memória **não** funciona corretamente com múltiplos
  processos/workers (ex: Gunicorn com vários workers), já Redis sim;
* integra com o próprio sistema de erros do Flask via `errorhandler`.

---

## 1. Dependências

```bash
pip install Flask-Limiter
```

Adicionar ao `requirements.txt`. Se for usar Redis como storage (recomendado em
produção):

```bash
pip install redis
```

---

## 2. Configuração (`.env` / `.env.exemple`)

```text
RATELIMIT_STORAGE_URI=memory://
RATELIMIT_DEFAULT=100 per minute
```

* Em desenvolvimento, `memory://` é suficiente.
* Em produção, trocar para `redis://<host>:<port>/<db>` — necessário se o servidor
  rodar com mais de um processo/worker, senão cada processo teria seu próprio
  contador e o limite real seria multiplicado pelo número de workers.
* `RATELIMIT_DEFAULT` funciona como o limite-base aplicado automaticamente a qualquer
  rota que não tenha um limite específico — na prática, é o perfil "autenticado"
  descrito no objetivo, já que as rotas sem autenticação vão ter overrides mais
  apertados.

---

## 3. `middlewares/CreateLimiter.py` (novo)

Segue a mesma lógica de infraestrutura de `RequireAuth.py`: bloqueia a request antes
de ela chegar no controller, mas por uma regra diferente (volume, não autenticação).

`createLimiter(app)` **(função única do arquivo)**:

1. lê `RATELIMIT_STORAGE_URI` e `RATELIMIT_DEFAULT` do `.env`;
2. instancia o `Limiter` usando `get_remote_address` (utilitário do próprio
   Flask-Limiter, baseado no IP da request) como `key_func`, `default_limits` e
   `storage_uri`;
3. chama `limiter.init_app(app)`;
4. retorna a instância `limiter` (para ser usada como decorator nas rotas).

O módulo expõe `limiter` como variável de módulo, para ser importada nos arquivos de
`routes/`.

---

## 4. `App.py` (editar o existente)

Ordem de inicialização:

1. `createApp()` cria o `Flask`;
2. `createLimiter(app)` é chamado logo em seguida, antes de `registerRoutes(app)`;
3. registrar um `errorhandler` para `RateLimitExceeded`, retornando um JSON
   consistente com o padrão de erros do projeto:

```json
{ "error": "rate_limit_exceeded", "message": "..." }
```

com status `429`.

---

## 5. `routes/` — aplicação dos limites por endpoint

### `routes/auth.py` — perfil apertado (sem autenticação)

```text
POST /auth/register  -> limiter.limit("5 per hour")    # por IP
POST /auth/login      -> limiter.limit("5 per minute")  # por IP
```

### `routes/user.py` — perfil folgado (autenticado)

```text
PATCH /users/me/password -> limiter.limit("20 per hour")  # por IP, mais folgado que login
```

As demais rotas (`GET/PATCH/DELETE /users/me`) ficam cobertas apenas pelo
`RATELIMIT_DEFAULT` global (`100 per minute`), sem necessidade de decorator
específico — é justamente o perfil "folgado" por padrão.

---

## 6. Fluxo

```text
Request
   ↓
middlewares/CreateLimiter.py -> limiter (via decorator na rota, chave = IP)
   ↓
dentro do limite do perfil da rota? --não--> 429 Too Many Requests
   ↓ sim
requireAuth() (se rota protegida)
   ↓
routes/*.py
   ↓
controllers/*.py
   ↓
services/*.py
```

---

## 7. Tratamento de erros

```text
429 -> limite de requisições excedido (rate limit)
```

Mantém-se consistente com os já definidos:

```text
400 -> dados inválidos
401 -> autenticação ausente/inválida
403 -> autenticado sem permissão
409 -> conflito (email/cpf/rgm duplicado)
429 -> excesso de requisições
```

---

## 8. Testes obrigatórios

* **Login**: exceder `5 per minute` a partir do mesmo IP → `429`; aguardar a janela
  expirar → volta a permitir.
* **Register**: exceder `5 per hour` a partir do mesmo IP → `429`.
* **Troca de senha**: exceder `20 per hour` a partir do mesmo IP → `429`.
* **Rotas autenticadas sem limite específico**: respeitam apenas o
  `RATELIMIT_DEFAULT` global (`100 per minute`).
* **Múltiplos usuários atrás do mesmo IP** (ex: rede da faculdade): validar que o uso
  normal das rotas autenticadas não esbarra no limite, graças ao perfil mais folgado.
* **Múltiplos processos** (se aplicável no ambiente de deploy): validar que o limite é
  respeitado de forma agregada quando usando Redis como storage.

---

## 9. Fora deste plano

* rate limiting em nível de infraestrutura (proxy reverso, Cloudflare, WAF) —
  complementar, não substitui a proteção da aplicação, mas fica fora do escopo do
  backend em si;
* limites diferenciados por `role` (ex: `admin` com limite maior) — pode ser avaliado
  quando a área administrativa existir;
* bloqueio permanente de IP após X violações (banimento) — o rate limit aqui é
  temporário (janela de tempo), não punitivo;
* diferenciar o limite por usuário autenticado (`user_id`) — descartado nesta versão
  em favor da simplicidade de tudo por IP.