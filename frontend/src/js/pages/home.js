/* =========================
   HOME
========================= */

/* MENU FIXO AO ROLAR A PÁGINA */
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("fixa");
        } else {
            navbar.classList.remove("fixa");
        }
    });
});


/* ÍCONE PARA MENU MOBILE */
document.addEventListener("DOMContentLoaded", () => {
    const btnMobile = document.querySelector(".btn-mobile");
    const navbar = document.querySelector(".navbar");

    if(btnMobile) {
        btnMobile.addEventListener("click", () => {
            navbar.classList.toggle("aberto");
        });
    }
});


/* SECTION SELECIONADA AO ROLAR A PÁGINA */
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".navbar ul li a");

    window.addEventListener("scroll", () => {
        let idAtual = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            
            if (window.scrollY >= sectionTop - 150) {
                idAtual = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("ativo");

            if (idAtual && link.getAttribute("href").includes(idAtual)) {
                link.classList.add("ativo");
            }
        });
    });
});


/* LINK PARA O TOPO DA PÁGINA */
document.addEventListener("DOMContentLoaded", () => {
    const btnTopo = document.getElementById("btn-topo");

    if (btnTopo) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                btnTopo.classList.add("mostrar");
            } else {
                btnTopo.classList.remove("mostrar");
            }
        });

        btnTopo.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});


/* COLOCA O ANO ATUAL */
const ano = new Date().getFullYear();
const elementoAno = document.querySelector(".ano-atual");
if (elementoAno) {
    elementoAno.textContent = ano;
}