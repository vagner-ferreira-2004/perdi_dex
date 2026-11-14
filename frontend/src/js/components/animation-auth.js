/* CONTAINER ANIMATION LOGIN E CADASTRO */
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

// Desativa transições no boot da página
container.classList.add("no-transition");

// Função para atualizar o título da página
function updateTitle(mode) {
    document.title = mode === "sign-up-mode" ? "Cadastro" : "Login";
}

// 1. Verifica parâmetro na URL
const urlParams = new URLSearchParams(window.location.search);
const modeParam = urlParams.get("mode");

let activeMode = "";

if (modeParam === "login") {
    activeMode = "";
    localStorage.setItem("mode", "");
    window.history.replaceState({}, document.title, window.location.pathname);
} else if (modeParam === "cadastro") {
    activeMode = "sign-up-mode";
    localStorage.setItem("mode", "sign-up-mode");
    window.history.replaceState({}, document.title, window.location.pathname);
} else {
    activeMode = localStorage.getItem("mode") || "";
}

// 2. Aplica o estado inicial instantaneamente
if (activeMode === "sign-up-mode") {
    container.classList.add("sign-up-mode");
    updateTitle("sign-up-mode");
} else {
    container.classList.remove("sign-up-mode");
    updateTitle("");
}

// Reativa as animações para cliques futuros
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        container.classList.remove("no-transition");
    });
});

// 3. Evento do botão de cadastro (com animação normal)
sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
    updateTitle("sign-up-mode");
    localStorage.setItem("mode", "sign-up-mode");
});

// 4. Evento do botão de login (com animação normal)
sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
    updateTitle("");
    localStorage.setItem("mode", "");
});