/* Mostrar Senha */
function mostrarSenha(btn) {
    var inputPass = btn.previousElementSibling;

    if (inputPass.type === 'password') {
        inputPass.setAttribute('type', 'text');
        btn.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        inputPass.setAttribute('type', 'password');
        btn.classList.replace('fa-eye-slash', 'fa-eye');
    }
}