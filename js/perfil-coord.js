import { me, changePassword } from './service/authService.js';

// Helper para obtener el valor de una cookie por nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Carga los datos del perfil
async function cargarPerfil() {
    try {
        const data = await me();

        if (!data.authenticated) {
            Swal.fire('Error', 'No autenticado. Por favor inicia sesión.', 'error');
            return;
        }

        const instructor = data.instructor;
        console.log('Datos del instructor:', instructor); // Debug log
        
        // Guardar el ID del instructor para el cambio de contraseña
        window.instructorId = instructor.id;
        
        document.getElementById('nombreUsuario').textContent = instructor.names.toUpperCase();
        document.getElementById('rolUsuario').textContent = instructor.role;
        document.getElementById('emailUsuario').textContent = instructor.email;
        document.getElementById('nombreCompletoUsuario').textContent = `${instructor.names} ${instructor.lastNames}`;
        document.getElementById('anioImpartidoUsuario').textContent = instructor.level || '';
        
        // Manejar la imagen del avatar
        const avatarElement = document.getElementById('avatarUsuario');
        console.log('instructorImage data:', instructor.instructorImage); // Debug log
        
        if (instructor.instructorImage && instructor.instructorImage.trim() !== '') {
            avatarElement.src = instructor.instructorImage;
            console.log('Avatar src set to:', instructor.instructorImage);
        } else {
            avatarElement.src = 'imgs/defaul-user.webp';
            console.log('Using default avatar');
        }
        
        // Error handler para la imagen
        avatarElement.onerror = function() {
            console.log('Error loading avatar, using default');
            this.src = 'imgs/defaul-user.webp';
        };
        
        // Mapear campos adicionales si están disponibles en la respuesta
        if (instructor.phone) {
            document.getElementById('telefonoUsuario').textContent = instructor.phone;
        }
    } catch (error) {
        console.error('Error cargando perfil:', error);
        Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
    }
}

// Maneja el cambio de contraseña
async function manejarCambioContrasena(event) {
    event.preventDefault();
    
    const contrasenaActual = document.getElementById('contrasenaActual').value;
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarNuevaContrasena = document.getElementById('confirmarNuevaContrasena').value;
    
    // Validaciones
    if (!contrasenaActual || !nuevaContrasena || !confirmarNuevaContrasena) {
        Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
        return;
    }
    
    if (nuevaContrasena !== confirmarNuevaContrasena) {
        Swal.fire('Error', 'Las contraseñas nuevas no coinciden.', 'error');
        return;
    }
    
    if (nuevaContrasena.length < 8) {
        Swal.fire('Error', 'La nueva contraseña debe tener al menos 8 caracteres.', 'error');
        return;
    }
    
    try {
        // Mostrar loading
        Swal.fire({
            title: 'Cambiando contraseña...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const result = await changePassword(window.instructorId);
        
        if (result.Success) {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: result.Message || 'Contraseña actualizada correctamente.'
            });
            
            // Limpiar formulario
            document.getElementById('formularioCambioContrasena').reset();
        } else {
            Swal.fire('Error', result.Message || 'No se pudo cambiar la contraseña.', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Error al cambiar la contraseña. Inténtalo de nuevo.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPerfil();
    
    // Agregar event listener para el formulario de cambio de contraseña
    const formulario = document.getElementById('formularioCambioContrasena');
    if (formulario) {
        formulario.addEventListener('submit', manejarCambioContrasena);
    }
});