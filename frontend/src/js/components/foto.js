/* ==========================================================
   MÓDULO DE RECORTE E CARREGAMENTO DE FOTOS (CROPPER.JS)
   ========================================================== */

const GerenciadorFoto = (() => {
    let cropper = null;
    let activeContainer = null;
    let currentFileName = "";
    let previousPreviewSrc = "";

    function obterElementosModal() {
        const modal = document.querySelector(".cropper-modal");
        if (!modal) return null;

        return {
            modal,
            cropImageEl: modal.querySelector(".image-to-crop"),
            btnClose: modal.querySelector(".btn-close-modal"),
            btnCancel: modal.querySelector(".btn-modal-cancel"),
            btnConfirm: modal.querySelector(".btn-modal-confirm")
        };
    }

    function fecharModalRecorte() {
        const els = obterElementosModal();
        if (!els) return;

        els.modal.style.display = "none";
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        if (els.cropImageEl) els.cropImageEl.src = "";

        if (activeContainer) {
            const input = activeContainer.querySelector(".upload-input");
            const preview = activeContainer.querySelector(".upload-preview");
            const placeholder = activeContainer.querySelector(".upload-placeholder");
            const filenameText = activeContainer.querySelector(".upload-filename");

            if (input) input.value = "";

            if (previousPreviewSrc && previousPreviewSrc.trim() !== "") {
                if (preview) {
                    preview.src = previousPreviewSrc;
                    preview.style.display = "block";
                }
                if (placeholder) placeholder.style.display = "none";
            } else {
                if (preview) {
                    preview.src = "";
                    preview.style.display = "none";
                }
                if (placeholder) placeholder.style.display = "flex";
                if (filenameText) filenameText.textContent = "";
            }
        }

        activeContainer = null;
        previousPreviewSrc = "";
    }

    function confirmarRecorte() {
        const els = obterElementosModal();
        if (!els || !cropper || !activeContainer) return;

        const canvas = cropper.getCroppedCanvas({
            width: 800,
            height: 800,
            imageSmoothingQuality: "high",
        });

        const base64Image = canvas.toDataURL("image/jpeg", 0.85);

        const preview = activeContainer.querySelector(".upload-preview");
        const placeholder = activeContainer.querySelector(".upload-placeholder");
        const filenameText = activeContainer.querySelector(".upload-filename");
        const hiddenBase64 = activeContainer.querySelector(".upload-base64-input");

        if (preview) {
            preview.src = base64Image;
            preview.style.display = "block";
        }
        
        if (placeholder) placeholder.style.display = "none";

        if (filenameText) {
            filenameText.textContent = currentFileName;
            filenameText.style.display = "block";
        }

        if (hiddenBase64) {
            hiddenBase64.value = base64Image;
        }

        previousPreviewSrc = base64Image;

        els.modal.style.display = "none";
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        if (els.cropImageEl) els.cropImageEl.src = "";
        activeContainer = null;
    }

    function processarFicheiro(container, file) {
        const els = obterElementosModal();
        if (!els) return;

        const maxSize = 10 * 1024 * 1024;
        const input = container.querySelector(".upload-input");
        const preview = container.querySelector(".upload-preview");

        if (file.size > maxSize) {
            alert("O arquivo ultrapassa o limite de 10 MB.");
            if (input) input.value = "";
            return;
        }

        if (typeof Cropper === "undefined") {
            console.error("Cropper.js não está carregado. Verifique os scripts no <head>.");
            return;
        }

        activeContainer = container;
        currentFileName = file.name;
        previousPreviewSrc = preview ? preview.src : "";

        const reader = new FileReader();
        reader.onload = (event) => {
            els.modal.style.display = "flex";

            els.cropImageEl.onload = () => {
                if (cropper) cropper.destroy();

                cropper = new Cropper(els.cropImageEl, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.9,
                    responsive: true,
                    guides: true,
                    center: true,
                    cropBoxResizable: true,
                    cropBoxMovable: true,
                });
            };

            els.cropImageEl.src = event.target.result;
        };

        reader.readAsDataURL(file);
    }

    function vincularContainerUpload(container) {
        if (!container || container.hasAttribute('data-foto-pronto')) return;
        container.setAttribute('data-foto-pronto', 'true');

        const box = container.querySelector(".upload-box");
        const input = container.querySelector(".upload-input");

        box?.addEventListener("click", (e) => {
            if (e.target !== input) input?.click();
        });

        input?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) processarFicheiro(container, file);
        });
    }

    function init() {
        const els = obterElementosModal();
        if (els) {
            els.btnClose?.addEventListener("click", fecharModalRecorte);
            els.btnCancel?.addEventListener("click", fecharModalRecorte);
            els.btnConfirm?.addEventListener("click", confirmarRecorte);
        }

        document.querySelectorAll(".upload-container").forEach(vincularContainerUpload);
    }

    return {
        init,
        vincularContainerUpload,
        fecharModalRecorte
    };
})();

window.GerenciadorFoto = GerenciadorFoto;

document.addEventListener("DOMContentLoaded", () => {
    // Timeout para permitir que os Web Components renderizem
    setTimeout(() => GerenciadorFoto.init(), 100);
});