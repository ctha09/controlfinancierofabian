document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('provModal');
    const openBtn = document.getElementById('openProvModal');
    const closeBtn = document.getElementById('closeBtn');

    // Función para abrir el modal al tocar el cuadro de proveedores
    if(openBtn) {
        openBtn.onclick = () => {
            modal.style.display = "block";
            // Aquí puedes llamar a la función que renderiza la lista de proveedores
        };
    }

    // Función para cerrar
    if(closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
        };
    }

    // Cerrar si hacen clic fuera del cuadro
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});
