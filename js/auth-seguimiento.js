document.addEventListener('DOMContentLoaded', function() {
    const botonVerSeguimiento = document.getElementById('verSeguimientoBtn');
    const entradaPlaca = document.getElementById('placa');

    if (botonVerSeguimiento && entradaPlaca) {
        botonVerSeguimiento.addEventListener('click', function() {
            const placa = entradaPlaca.value.trim();

            if (placa) {
                if (placa.length < 3) {
                    Swal.fire({
                        title: 'Entrada Inválida',
                        text: 'Por favor, ingresa al menos 3 caracteres para la placa, tarjeta de circulación o DUI.',
                        icon: 'warning',
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title',
                            content: 'swal-custom-content',
                            confirmButton: 'swal-custom-confirm-button'
                        }
                    });
                    return;
                }
                window.location.href = `seguimiento.html?placa=${encodeURIComponent(placa)}`;
            } else {
                Swal.fire({
                    title: 'Campo Vacío',
                    text: 'Por favor, ingresa tu número de placa, tarjeta de circulación o DUI.',
                    icon: 'info',
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title',
                        content: 'swal-custom-content',
                        confirmButton: 'swal-custom-confirm-button'
                    }
                });
            }
        });
    } else {
        console.error("Error: No se encontró el botón o el campo de entrada en el DOM.");
    }
});