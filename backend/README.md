# Lost and Found

## Banco de dados

O backend usa MySQL, SQLAlchemy e Alembic. Configure `.env` com as variáveis `DB_*`.
O comando `db:reset` cria o banco usando `DB_NAME`; se ele já existir, apaga tudo e recria a estrutura e os seeds.

A partir desta pasta (`backend/`):

```bash
py -m pip install -r requirements.txt
py manage.py db:reset
```

Para iniciar o servidor, a conexão com o banco é validada antes da aplicação HTTP subir:

```bash
py server.py
```

Se o banco estiver indisponível, o processo informa o erro e termina com código `1`.

## Frontend e acesso pelo Ngrok

O cliente web aponta por padrão para a URL pública atual do backend:
`https://surging-enjoyably-cost.ngrok-free.dev`. Se a URL do Ngrok mudar, atualize o
valor padrão em `frontend/src/js/global/api.js`.

Para permitir sessões por cookie quando o frontend local (`http://localhost:5500`)
acessa o backend pelo Ngrok, configure estas variáveis no `backend/.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5500
SESSION_COOKIE_SAMESITE=None
SESSION_COOKIE_SECURE=true
```

Reinicie o backend depois de alterar o `.env`. O Ngrok deve encaminhar para a mesma
porta definida em `SERVER_PORT` (por padrão, `3333`).

Para servir o frontend localmente, inicie o backend e, em outro terminal, execute:

```bash
cd ../frontend
py -m http.server 5500 --bind localhost
```

Abra `http://localhost:5500/pages/auth/index.html`. Não abra o arquivo HTML diretamente
com `file://`; isso faz o navegador enviar as chamadas à origem errada. Se usar outra
origem/porta para o frontend, configure `CORS_ALLOWED_ORIGINS` no `.env` do backend com
a origem exata, por exemplo `http://localhost:5501`. Não use `*` com sessões por cookie.

Comandos do Alembic disponíveis dentro de `backend/`:

```bash
py -m alembic upgrade head
py -m alembic downgrade -1
py -m database.seeds.seed
```

Toda alteração estrutural deve ser feita por uma nova migration. Não edite migrations já aplicadas ou compartilhadas.

### Criar a conta administradora inicial

A migration `0007_create_bootstrap_admin` cria uma conta administrativa com as variáveis
`BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_CPF`,
`BOOTSTRAP_ADMIN_PHONE` e `BOOTSTRAP_ADMIN_PASSWORD`. Defina esses valores no `backend/.env`
local, nunca no repositório. A senha deve ter de 12 a 128 caracteres e é armazenada somente
como hash. A migration falha sem inserir a conta se faltar um valor, se os dados forem
inválidos ou se o e-mail/CPF já estiver cadastrado.

Depois de configurar as variáveis, aplique as migrations:

```bash
py -m alembic upgrade head
```

O comando `py manage.py db:reset` também aplica a migration e portanto exige essas variáveis.
O downgrade da migration remove a conta somente se ela ainda não tiver registros vinculados.
