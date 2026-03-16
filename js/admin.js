document.addEventListener('DOMContentLoaded', function() {
  const enlacesNavegacion = document.querySelectorAll('.barra-navegacion-centro .enlace-navegacion');
  const enlacePerfilUsuario = document.querySelector('.barra-navegacion-derecha .info-usuario-enlace');

  // Marca el enlace activo en la barra de navegación
  function establecerEnlaceActivo() {
    const rutaActual = window.location.pathname.split('/').pop();

    enlacesNavegacion.forEach(enlace => {
      enlace.classList.remove('active');
      const hrefEnlace = enlace.getAttribute('href');

      if (hrefEnlace && hrefEnlace.includes(rutaActual)) {
        enlace.classList.add('active');
      }
    });

    if (rutaActual === 'perfil-coord.html' && enlacePerfilUsuario) {
        // ...puedes agregar lógica visual si lo requieres...
    }
  }

  enlacePerfilUsuario.addEventListener('click', function(e) {
    // Permite la navegación predeterminada al perfil
  });

  establecerEnlaceActivo();

  window.addEventListener('hashchange', establecerEnlaceActivo);
});