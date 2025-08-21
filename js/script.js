// Só executa quando o HTML estiver carregado
document.addEventListener("DOMContentLoaded", function() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) { // verifica se o elemento existe na página
        yearSpan.textContent = new Date().getFullYear();
    }
});