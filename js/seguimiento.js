document.addEventListener("DOMContentLoaded", function () {
  const parametrosURL = new URLSearchParams(window.location.search);
  const placa = parametrosURL.get("placa");

  const numeroRegistroSpan = document.getElementById("numeroRegistro");
  const infoModeloSpan = document.getElementById("infoModelo");
  const estadoAjusteParrafo = document.getElementById("estadoAjuste");
  const infoPlacaSpan = document.getElementById("infoPlaca");
  const estudianteAsignadoSpan = document.getElementById("estudianteAsignado");
  const moduloAsignadoSpan = document.getElementById("moduloAsignado");
  const nombreContactoSpan = document.getElementById("nombreContacto");
  const barraProgresoDiv = document.getElementById("barraProgreso");
  const porcentajeProgresoSpan = document.getElementById("porcentajeProgreso");
  const tiempoRestanteSpan = document.getElementById("tiempoRestante");
  const tiempoTotalSpan = document.getElementById("tiempoTotal");
  const imagenVehiculo = document.getElementById("imagenVehiculo");
  const cuadriculaTareasReparacion = document.getElementById("cuadriculaTareasReparacion");
  const listaActualizaciones = document.getElementById("listaActualizaciones");

  // Llena los datos del vehículo en la vista
  const popularDatosVehiculo = (datos) => {
    numeroRegistroSpan.textContent = datos.numeroRegistro || "N/A";
    infoModeloSpan.textContent = datos.modelo || "Vehículo Desconocido";
    estadoAjusteParrafo.textContent = datos.estado || "Sin Información";
    infoPlacaSpan.textContent = datos.placa || "Placa no especificada";
    estudianteAsignadoSpan.textContent = datos.estudianteAsignado || "N/A";
    moduloAsignadoSpan.textContent = datos.moduloAsignado || "N/A";
    nombreContactoSpan.textContent = datos.nombreContacto || "N/A";

    barraProgresoDiv.style.width = datos.porcentajeProgreso + "%";
    porcentajeProgresoSpan.textContent = datos.porcentajeProgreso + "%";
    tiempoRestanteSpan.textContent = datos.tiempoRestante || "N/A";
    tiempoTotalSpan.textContent = datos.tiempoTotal || "N/A";

    if (datos.imagenVehiculo) {
      imagenVehiculo.src = datos.imagenVehiculo;
    } else {
      imagenVehiculo.src = "imgs/default_vehicle.jpg";
    }

    if (datos.tareas && datos.tareas.length > 0) {
      cuadriculaTareasReparacion.innerHTML = "";
      datos.tareas.forEach(tarea => {
        const itemTarea = document.createElement("div");
        itemTarea.className = "item-tarea";
        itemTarea.innerHTML = `<i class="${tarea.icono}"></i><span>${tarea.texto}</span>`;
        cuadriculaTareasReparacion.appendChild(itemTarea);
      });
    } else if (placa) {
        cuadriculaTareasReparacion.innerHTML = `<div class="item-tarea"><i class="fas fa-info-circle"></i><span>No se encontraron tareas de reparación.</span></div>`;
    }

    if (datos.actualizaciones && datos.actualizaciones.length > 0) {
      listaActualizaciones.innerHTML = "";
      datos.actualizaciones.forEach(actualizacion => {
        const li = document.createElement("li");
        li.textContent = actualizacion;
        listaActualizaciones.appendChild(li);
      });
    } else if (placa) {
        listaActualizaciones.innerHTML = `<li class="sin-resultados">No se encontraron actualizaciones para este vehículo.</li>`;
    }
  };

  // Obtiene los datos del vehículo por placa
  const obtenerDatosVehiculoPorPlaca = (placa) => {
    switch (placa.toUpperCase()) {
      case "ABC-123":
        return {
          numeroRegistro: "20250428",
          modelo: "Volvo - XC40",
          estado: "Ajustes eléctricos completo",
          placa: "P258-854",
          estudianteAsignado: "Manuel Perez",
          moduloAsignado: "Sistemas Eléctricos",
          nombreContacto: "José E.",
          porcentajeProgreso: 85,
          tiempoRestante: "30 min restantes",
          tiempoTotal: "6h totales",
          imagenVehiculo: "imgs/volvo.jpg",
          tareas: [
            { icono: "fas fa-lightbulb", texto: "Conexión y reparación de luces" },
            { icono: "fas fa-window-restore", texto: "Reparación de puertas y ventanas" },
            { icono: "fas fa-wind", texto: "Reparación de Parabrisas" },
            { icono: "fas fa-car-crash", texto: "Cambio de Airbag" },
            { icono: "fas fa-eye", texto: "Reparación de espejo" },
          ],
          actualizaciones: [
            "2025-06-10: Revisión inicial completada.",
            "2025-06-11: Componentes eléctricos diagnosticados.",
            "2025-06-12: Inicio de ajustes eléctricos.",
            "2025-06-13: Pruebas finales de sistemas eléctricos.",
            "2025-06-14: Ajustes eléctricos completados. Próximo: Inspección general."
          ]
        };
      case "ABC-122":
        return {
          numeroRegistro: "20231026",
          modelo: "Sedán Genérico",
          estado: "En reparación - Motor",
          placa: "ABC-123",
          estudianteAsignado: "Ana López",
          moduloAsignado: "Mecánica General",
          nombreContacto: "Carlos R.",
          porcentajeProgreso: 50,
          tiempoRestante: "12h restantes",
          tiempoTotal: "24h totales",
          imagenVehiculo: "imgs/volvo.jpg",
          tareas: [
            { icono: "fas fa-gears", texto: "Revisión de motor" },
            { icono: "fas fa-oil-can", texto: "Cambio de aceite" },
            { icono: "fas fa-cogs", texto: "Ajuste de transmisión" },
          ],
          actualizaciones: [
            "2023-10-26: Recepción del vehículo para diagnóstico.",
            "2023-10-27: Diagnóstico completado. Problema en el motor detectado.",
            "2023-10-28: Inicio de la reparación del motor.",
            "2023-10-30: 50% de la reparación del motor completada."
          ]
        };
      default:
        return null;
    }
  };

  if (placa) {
    const datosVehiculo = obtenerDatosVehiculoPorPlaca(placa);
    if (datosVehiculo) {
      popularDatosVehiculo(datosVehiculo);
    } else {
      popularDatosVehiculo({
        numeroRegistro: "N/A",
        modelo: "Vehículo no encontrado",
        estado: "Placa no registrada en el sistema",
        placa: placa,
        estudianteAsignado: "N/A",
        moduloAsignado: "N/A",
        nombreContacto: "N/A",
        porcentajeProgreso: 0,
        tiempoRestante: "N/A",
        tiempoTotal: "N/A",
        actualizaciones: ["No se encontraron resultados para la placa: " + placa],
        tareas: [],
      });
    }
  } else {
    popularDatosVehiculo({
      numeroRegistro: "N/A",
      modelo: "Por favor, ingresa una placa",
      estado: "Esperando búsqueda...",
      placa: "N/A",
      estudianteAsignado: "N/A",
      moduloAsignado: "N/A",
      nombreContacto: "N/A",
      porcentajeProgreso: 0,
      tiempoRestante: "N/A",
      tiempoTotal: "N/A",
      actualizaciones: ["Ingresa una placa para ver el seguimiento del vehículo."],
      tareas: [],
    });
  }

  const botonContacto = document.querySelector(".boton-contacto");
  if (botonContacto) {
    botonContacto.addEventListener("click", function(e) {
      e.preventDefault();
      alert("Contactar a " + nombreContactoSpan.textContent);
    });
  }

  const usuarioInfoDiv = document.querySelector(".info-usuario");
  if (usuarioInfoDiv) {
    usuarioInfoDiv.addEventListener("click", function() {
      window.location.href = "perfil.html";
    });
  }
});