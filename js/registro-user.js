document.addEventListener('DOMContentLoaded', () => {
    const formularioRegistro = document.getElementById('formulario-registro');
    const entradaNombres = document.getElementById('nombres');
    const entradaApellidos = document.getElementById('apellidos');
    const entradaCorreo = document.getElementById('correo');
    const errorCorreo = document.getElementById('error-correo');
    const entradaPassword = document.getElementById('password');

    const contenedorGradoPersonalizado = document.querySelector('.grupo-entrada:has(#grado)');
    const gatilloGradoPersonalizado = document.getElementById('gatillo-grado-personalizado');
    const textoGradoSeleccionado = document.getElementById('texto-grado-seleccionado');
    const opcionesGradoPersonalizado = document.getElementById('opciones-grado-personalizado');
    const selectorNativoGrado = document.getElementById('grado');

    const entradaFotoPerfil = document.getElementById('fotoPerfil');
    const vistaPreviaFoto = document.getElementById('vistaPreviaFoto');
    const urlFotoPerfilInput = document.getElementById('urlFotoPerfil');

    const nombreUsuarioNav = document.getElementById('nombre-usuario');
    const rolUsuarioNav = document.getElementById('rol-usuario');
    const detalleUsuarioNav = document.getElementById('detalle-usuario');
    const avatarUsuarioNav = document.getElementById('avatar-usuario');

    // Muestra alertas personalizadas
    const showCustomSwal = (icon, title, text, showConfirmButton = true, timer = 0) => {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                content: 'swal-custom-content',
                confirmButton: 'swal-custom-confirm-button'
            },
            showConfirmButton: showConfirmButton,
            timer: timer > 0 ? timer : null,
            timerProgressBar: timer > 0
        });
    };

    // Carga datos de usuario en el navbar
    const cargarDatosUsuarioNav = () => {
        if (nombreUsuarioNav && rolUsuarioNav && detalleUsuarioNav && avatarUsuarioNav) {
            const usuarioSesion = JSON.parse(localStorage.getItem('usuarioSesion'));
            if (usuarioSesion) {
                nombreUsuarioNav.textContent = usuarioSesion.fullName ? usuarioSesion.fullName.toUpperCase() : 'USUARIO';
                if (usuarioSesion.tbRoleId === "2") {
                    rolUsuarioNav.textContent = 'Maestro';
                    detalleUsuarioNav.textContent = '';
                } else if (usuarioSesion.tbRoleId === "3") {
                    rolUsuarioNav.textContent = 'Alumno';
                    detalleUsuarioNav.textContent = usuarioSesion.grado ? usuarioSesion.grado.charAt(0).toUpperCase() + usuarioSesion.grado.slice(1) + ' Año' : '';
                }
                avatarUsuarioNav.src = usuarioSesion.fotoPerfil || 'placeholder-avatar.png';
            } else {
                nombreUsuarioNav.textContent = 'INVITADO';
                rolUsuarioNav.textContent = '';
                detalleUsuarioNav.textContent = '';
                avatarUsuarioNav.src = 'placeholder-avatar.png';
            }
        }
    };

    cargarDatosUsuarioNav();

    gatilloGradoPersonalizado.addEventListener('click', (evento) => {
        evento.stopPropagation();
        opcionesGradoPersonalizado.classList.toggle('abierto');
        gatilloGradoPersonalizado.classList.toggle('activo');
    });

    document.addEventListener('click', (evento) => {
        if (!gatilloGradoPersonalizado.contains(evento.target) && !opcionesGradoPersonalizado.contains(evento.target)) {
            opcionesGradoPersonalizado.classList.remove('abierto');
            gatilloGradoPersonalizado.classList.remove('activo');
        }
    });

    opcionesGradoPersonalizado.querySelectorAll('.opcion-personalizada').forEach(opcion => {
        opcion.addEventListener('click', function() {
            const valor = this.dataset.value;
            const texto = this.textContent;

            textoGradoSeleccionado.textContent = texto;
            selectorNativoGrado.value = valor;

            opcionesGradoPersonalizado.querySelectorAll('.opcion-personalizada').forEach(opt => opt.classList.remove('seleccionada'));
            this.classList.add('seleccionada');

            opcionesGradoPersonalizado.classList.remove('abierto');
            gatilloGradoPersonalizado.classList.remove('activo');

            const evento = new Event('change', { bubbles: true });
            selectorNativoGrado.dispatchEvent(evento);
        });
    });

    if (selectorNativoGrado.value) {
        const opcionSeleccionada = opcionesGradoPersonalizado.querySelector(`.opcion-personalizada[data-value="${selectorNativoGrado.value}"]`);
        if (opcionSeleccionada) {
            textoGradoSeleccionado.textContent = opcionSeleccionada.textContent;
            opcionSeleccionada.classList.add('seleccionada');
        }
    } else {
        textoGradoSeleccionado.textContent = selectorNativoGrado.querySelector('option[value=""]').textContent;
    }

    entradaFotoPerfil.addEventListener('change', (evento) => {
        const archivo = evento.target.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = (e) => {
                vistaPreviaFoto.src = e.target.result;
                vistaPreviaFoto.style.display = 'block';
            };
            lector.readAsDataURL(archivo);
        } else {
            vistaPreviaFoto.src = '#';
            vistaPreviaFoto.style.display = 'none';
        }
    });

    entradaCorreo.addEventListener('input', () => {
        const correo = entradaCorreo.value.trim();
        const dominioPermitido = '@ricaldone.edu.sv';
        const patronMaestro = /^[a-zA-Z0-9.]+_[a-zA-Z0-9.]+@ricaldone\.edu\.sv$/;

        errorCorreo.textContent = '';
        errorCorreo.style.display = 'none';

        if (!correo.endsWith(dominioPermitido)) {
            errorCorreo.textContent = 'Correo no permitido, por favor utiliza un correo de ' + dominioPermitido;
            errorCorreo.style.display = 'block';
            contenedorGradoPersonalizado.style.display = 'block';
            selectorNativoGrado.setAttribute('required', 'true');
            return;
        }

        if (patronMaestro.test(correo)) {
            contenedorGradoPersonalizado.style.display = 'none';
            selectorNativoGrado.removeAttribute('required');
            selectorNativoGrado.value = '';
            textoGradoSeleccionado.textContent = 'Selecciona tu año';
            opcionesGradoPersonalizado.querySelectorAll('.opcion-personalizada').forEach(opt => opt.classList.remove('seleccionada'));
        } else {
            contenedorGradoPersonalizado.style.display = 'block';
            selectorNativoGrado.setAttribute('required', 'true');
        }
    });

    entradaCorreo.dispatchEvent(new Event('input'));

    formularioRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        errorCorreo.textContent = '';
        errorCorreo.style.display = 'none';

        const nombres = entradaNombres.value.trim();
        const apellidos = entradaApellidos.value.trim();
        const correo = entradaCorreo.value.trim();
        const password = entradaPassword.value.trim();
        
        let idRolTb;
        let grado = '';

        if (!nombres || !apellidos || !correo || !password) {
            showCustomSwal('error', 'Error de Validación', 'Por favor, completa todos los campos obligatorios.');
            return;
        }

        const dominioPermitido = '@ricaldone.edu.sv';
        const patronMaestro = /^[a-zA-Z0-9.]+_[a-zA-Z0-9.]+@ricaldone\.edu\.sv$/;

        if (!correo.endsWith(dominioPermitido)) {
            errorCorreo.textContent = 'Correo no permitido, por favor utiliza un correo de ' + dominioPermitido;
            errorCorreo.style.display = 'block';
            showCustomSwal('error', 'Correo Inválido', 'El correo electrónico debe terminar con ' + dominioPermitido + '.');
            return;
        }

        if (password.length < 6) {
            showCustomSwal('error', 'Contraseña Inválida', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (patronMaestro.test(correo)) {
            idRolTb = "2";
        } else {
            idRolTb = "3";
            grado = selectorNativoGrado.value.trim();
            if (!grado) {
                showCustomSwal('error', 'Error de Validación', 'Por favor, selecciona tu año.');
                return;
            }
        }

        let urlImagen = '';

        if (entradaFotoPerfil.files.length > 0) {
            const archivoFoto = entradaFotoPerfil.files[0];
            const datosFormulario = new FormData();
            datosFormulario.append('image', archivoFoto);

            try {
                const urlApiImagen = 'https://api.imgbb.com/1/upload?expiration=600&key=eaf6049b5324954d994475cb0c0a6156';

                const respuestaImagen = await fetch(urlApiImagen, {
                    method: 'POST',
                    body: datosFormulario,
                });

                if (respuestaImagen.ok) {
                    const resultadoImagen = await respuestaImagen.json();
                    urlImagen = resultadoImagen.data.url;
                    urlFotoPerfilInput.value = urlImagen;
                } else {
                    const datosError = await respuestaImagen.json();
                    showCustomSwal('error', 'Error al Subir Imagen', 'Error al subir la imagen de perfil: ' + (datosError.message || 'Ocurrió un problema.'));
                    return;
                }
            } catch (error) {
                showCustomSwal('error', 'Error de Conexión', 'Ocurrió un error inesperado al subir la imagen. Inténtalo de nuevo.');
                return;
            }
        }

        const nuevoUsuario = {
            email: correo,
            password: password,
            fullName: `${nombres} ${apellidos}`,
            tbRoleId: idRolTb,
            fotoPerfil: urlImagen
        };

        if (idRolTb === "3") {
            nuevoUsuario.grado = grado;
        }

        try {
            const response = await fetch('https://685b5bb389952852c2d94520.mockapi.io/tbUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoUsuario),
            });

            if (response.ok) {
                const result = await response.json();

                localStorage.setItem('usuarioSesion', JSON.stringify({
                    email: nuevoUsuario.email,
                    fullName: nuevoUsuario.fullName,
                    tbRoleId: nuevoUsuario.tbRoleId,
                    grado: nuevoUsuario.grado,
                    fotoPerfil: nuevoUsuario.fotoPerfil
                }));
                cargarDatosUsuarioNav();

                showCustomSwal('success', '¡Éxito!', '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', false, 2000)
                .then(() => {
                    window.location.href = 'login.html';
                });
            } else {
                const datosError = await response.json();
                showCustomSwal('error', 'Error al Crear Cuenta', 'Error al crear la cuenta: ' + (datosError.message || 'Ocurrió un problema. Inténtalo de nuevo.'));
            }
        } catch (error) {
            showCustomSwal('error', 'Error de Conexión', 'Ocurrió un error inesperado al intentar crear la cuenta. Por favor, inténtalo de nuevo más tarde.');
        }
    });

    entradaCorreo.dispatchEvent(new Event('input'));
});