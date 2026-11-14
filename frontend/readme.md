# 🔍 Perdidex - Sistema de Achados e Perdidos - Frontend

Este repositório contém o código-fonte do Frontend do Perdidex. A aplicação foi projetada para facilitar o registro, busca e devolução de itens perdidos, contando com interfaces dedicadas tanto para usuários comuns quanto para administradores do sistema, sendo utilizado HTML, CSS e JavaScript.

## 🚀 Funcionalidades

A interface foi dividida em três fluxos principais:

### 👤 Área do Usuário (`/pages/user/`)
* **Dashboard:** Visão geral do usuário.
* **Cadastro de Itens:** Formulário para registrar um item perdido que foi encontrado, além da galeria e busca de itens cadastrados e pertences achados do usuário.
* **Itens do Sistema:** Galeria e busca de todos os itens atualmente registrados no sistema.
* **Notificações:** Avisos e alertas sobre atualizações de cadatros e solicitações de itens do usuário.
* **Configurações:** Gerenciamento do perfil do usuário.
* **Ajuda:** Central de ajuda para tirar dúvidas.

### 🛡️ Área do Administrador (`/pages/admin/`)
* **Dashboard:** Visão geral do sistema, com gráficos e estatísticas sobre itens perdidos e recuperados.
* **Gestão de Análises:** Controle total sobre os itens cadastrados e solicitações dos usuários.
* **Gestão de Usuários:** Listagem e moderação das contas cadastradas.
* **Notificações:** Avisos sobre novos cadastros e solicitações para analisar.
* **Configurações:** Gerenciamento do perfil do administrador.

### 🔐 Autenticação (`/pages/auth/`)
* Telas de Login e Cadastro com animações interativas.

## 📁 Estrutura do Projeto

O projeto foi organizado para facilitar a visualização e manutenção da seguinte forma:

```text
frontend/
├── components/          # Fragmentos de HTML reutilizáveis (buscar itens sem login, termos, privacidade)
├── pages/               # Páginas principais da aplicação (admin, auth, user)
├── src/                 # Arquivos estáticos (Assets)
│   ├── css/             # Estilos separados em globais, componentes e páginas
│   ├── fonts/           # Fontes locais (Poppins e Baloo 2)
│   ├── images/          # Fotos de exemplos, ilustrações e logotipos
│   └── js/              # Scripts de lógica isolada por componente e página
└── index.html           # Landing page / Página inicial
```

## 🎨 Arquitetura CSS e JavaScript

Para evitar arquivos gigantes e difíceis de visualizar, os estilos e scripts foram separados e organizados para cada função.

### Estilos (CSS)
Localizados em `src/css/`, seguem uma abordagem baseada em componentes:
* **`global/`**: Estilos base da aplicação.
  * `reset.css`: Limpeza de estilos padrão dos navegadores.
  * `vars.css`: Definição de variáveis CSS (Cores, espaçamentos, tipografia) para fácil acesso.
  * `global.css`: Estilizações genéricas aplicadas a todo o sistema.
* **`components/`**: Arquivos isolados para elementos da interface, facilitando o reaproveitamento:
  * `menu.css`, `modais.css`, `filtros.css`, `itens.css`, `data.css`.
  * `animation-auth.css`: Estilização específica das animações nas telas de login/cadastro.
  * `media-queries.css`: Regras de responsividade para adaptação mobile/tablet.
* **`pages/`**: Estilos restritos a páginas específicas (`auth.css`, `dashboard-user.css`, `cadastro-item.css`, etc.).

### Lógica (JavaScript)
Localizados em `src/js/`, focados em manipular o DOM de forma interativa e assíncrona:
* **`global/`**: Scripts transversais a toda a aplicação.
  * `tema.js`: Gerenciamento e persistência do tema (Dark Mode / Light Mode).
  * `banco-dados.js`: Lógica de estruturação e visualização dos dados.
  * `font-awesome.js`: Integração com a biblioteca de ícones.
* **`components/`**: Scripts que dão vida aos elementos:
  * **Interatividade:** `arrastar-cards.js`, `modais-itens.js`, `menu.js`, `select.js`.
  * **Funcionalidades:** `search.js` (lógica de busca), `foto.js` (manipulação/preview de uploads).
  * **Visualização:** `graficos.js` e `graficos-admin.js` (renderização de dados analíticos).
  * **Validações:** `senha.js` (regras e visualização de senha nas telas de auth).
* **`pages/`**: Controladores principais de cada tela, que orquestram os componentes (ex: `cadastro-item.js`, `dashboard.js`, `notificacoes.js`).

## 🛠️ Tecnologias Utilizadas

* **HTML:** Semântica e estruturação.
* **CSS:** Estilização responsiva, animações e variáveis para CSS.
* **JavaScript:** Manipulação avançada do DOM, modularidade e lógica de interface.
* **Fontes:** [Poppins](https://fonts.google.com/specimen/Poppins) e [Baloo 2](https://fonts.google.com/specimen/Baloo+2).
* **Ícones:** [FontAwesome](https://fontawesome.com) e [FlatIcon](https://www.flaticon.com).
