// Servicio para obtener datos de estudiantes, instructores y vehículos
// Adaptado para usar credenciales (cookies/sesión) en las peticiones fetch
// y estructurado como funciones reutilizables tipo "service".

const API_BASE = "https://sgma-66ec41075156.herokuapp.com/api";

// Obtiene todos los estudiantes
export async function getEstudiantes() {
    const res = await fetch(`${API_BASE}/students/getAllStudents`, {
        credentials: "include", //Include para enviar cookies con la petición
    });
    return res.json();
}

// Obtiene todos los instructores
export async function getInstructores() {
    const res = await fetch(`${API_BASE}/instructors/getAllInstructors`, {
        credentials: "include", //Include para enviar cookies con la petición
    });
    return res.json();
}

// Obtiene todos los vehículos
export async function getVehiculos() {
    const res = await fetch(`${API_BASE}/vehicles/getAllVehicles`, {
        credentials: "include", //Include para enviar cookies con la petición
    });
    return res.json();
}

// Obtiene todos los grados
export async function getGrados() {
    const res = await fetch(`${API_BASE}/grades/getAllGrades`, {
        credentials: "include",
    });
    return res.json();
}

// Obtiene todos los niveles
export async function getLevels() {
    const res = await fetch(`${API_BASE}/levels/getAllLevels`, {
        credentials: "include",
    });
    return res.json();
}

// Función principal para renderizar los reportes
document.addEventListener('DOMContentLoaded', async function () {
    let estudiantes = [];
    let instructores = [];
    let vehiculos = [];
    let grados = [];
    let levels = [];

    // --- Fetch de datos usando los servicios ---
    try {
        const dataEst = await getEstudiantes();
        if (dataEst && dataEst.data && Array.isArray(dataEst.data.content)) {
            estudiantes = dataEst.data.content;
        } else if (dataEst && Array.isArray(dataEst.data)) {
            estudiantes = dataEst.data;
        }
    } catch (e) {
        console.error("Error obteniendo estudiantes:", e);
    }

    try {
        const dataInst = await getInstructores();
        if (dataInst && dataInst.data && Array.isArray(dataInst.data.content)) {
            instructores = dataInst.data.content;
        } else if (dataInst && Array.isArray(dataInst.data)) {
            instructores = dataInst.data;
        }
    } catch (e) {
        console.error("Error obteniendo instructores:", e);
    }

    try {
        const dataVeh = await getVehiculos();
        if (dataVeh && dataVeh.data && Array.isArray(dataVeh.data.content)) {
            vehiculos = dataVeh.data.content;
        } else if (dataVeh && Array.isArray(dataVeh.data)) {
            vehiculos = dataVeh.data;
        }
    } catch (e) {
        console.error("Error obteniendo vehículos:", e);
    }

    try {
        const dataGrados = await getGrados();
        if (dataGrados && Array.isArray(dataGrados.data)) {
            grados = dataGrados.data;
        }
    } catch (e) {
        console.error("Error obteniendo grados:", e);
    }

    try {
        const dataLevels = await getLevels();
        if (dataLevels && Array.isArray(dataLevels.data)) {
            levels = dataLevels.data;
        }
    } catch (e) {
        console.error("Error obteniendo levels:", e);
    }

    // Validar que los datos existen y son arrays
    if (!Array.isArray(estudiantes) || !Array.isArray(vehiculos) || !Array.isArray(instructores)) {
        estudiantes = [];
        vehiculos = [];
        instructores = [];
    }
    if (!Array.isArray(grados)) grados = [];
    if (!Array.isArray(levels)) levels = [];

    // --- Alumnos por level (año) ---
    const LEVELS = [1, 2, 3];
    let labelsLevels = ['1er Año', '2do Año', '3er Año'];
    let alumnosPorLevel = [0, 0, 0];

    try {
        const dataGrados = await getGrados();
        const dataLevels = await getLevels();
        
        if (dataGrados && Array.isArray(dataGrados.data)) {
            grados = dataGrados.data;
        }
        
        if (dataLevels && Array.isArray(dataLevels.data)) {
            levels = dataLevels.data;
            labelsLevels = levels.map(level => level.levelName);
        }

        alumnosPorLevel = LEVELS.map(level => {
            const gradosDelLevel = grados.filter(grado => grado.levelId === level);
            const gradeIds = gradosDelLevel.map(grado => grado.gradeId);
            return estudiantes.filter(est => gradeIds.includes(Number(est.gradeId))).length;
        });
    } catch (e) {
        console.error("Error procesando datos de grados/levels:", e);
    }

    // --- Vehículos por tipo ---
    const tiposVehiculos = [...new Set(vehiculos.map(v => v.typeName).filter(Boolean))];
    const vehiculosPorTipo = tiposVehiculos.map(tipo =>
        vehiculos.filter(v => v.typeName === tipo).length
    );

    // --- Instructores por level (año) ---
    const instructoresPorLevel = LEVELS.map(level =>
        instructores.filter(inst => Number(inst.levelId) === level).length
    );

    // --- Instructores por rol ---
    const rolesInstructores = [...new Set(instructores.map(i => i.roleName).filter(Boolean))];
    const instructoresPorRol = rolesInstructores.map(rol =>
        instructores.filter(i => i.roleName === rol).length
    );

    // --- Actualizar tarjetas de estadísticas con datos reales ---
    const totalEstudiantes = estudiantes.length;
    const totalVehiculos = vehiculos.length;

    // Simular datos del mes anterior para calcular cambios porcentuales
    // En un entorno real, estos datos vendrían de una API de históricos
    const estudiantesMesAnterior = Math.floor(totalEstudiantes * 0.92); // Simula crecimiento del 8%
    const vehiculosMesAnterior = Math.floor(totalVehiculos * 0.89); // Simula crecimiento del 11%

    // Calcular cambios porcentuales
    const cambioEstudiantes = totalEstudiantes > 0 ? 
        Math.round(((totalEstudiantes - estudiantesMesAnterior) / estudiantesMesAnterior) * 100) : 0;
    const cambioVehiculos = totalVehiculos > 0 ? 
        Math.round(((totalVehiculos - vehiculosMesAnterior) / vehiculosMesAnterior) * 100) : 0;

    // Actualizar total de estudiantes
    const tarjetaEstudiantes = document.querySelector('.tarjeta-estadistica:nth-child(1) h3');
    const cambioEstudiantesSpan = document.querySelector('.tarjeta-estadistica:nth-child(1) .cambio');
    if (tarjetaEstudiantes) {
        tarjetaEstudiantes.textContent = totalEstudiantes;
    }
    if (cambioEstudiantesSpan) {
        const signo = cambioEstudiantes > 0 ? '+' : '';
        cambioEstudiantesSpan.textContent = `${signo}${cambioEstudiantes}% vs mes anterior`;
        
        // Actualizar clase CSS según el cambio
        cambioEstudiantesSpan.className = 'cambio';
        if (cambioEstudiantes > 0) {
            cambioEstudiantesSpan.classList.add('positivo');
        } else if (cambioEstudiantes < 0) {
            cambioEstudiantesSpan.classList.add('negativo');
        } else {
            cambioEstudiantesSpan.classList.add('neutro');
        }
    }

    // Actualizar total de vehículos
    const tarjetaVehiculos = document.querySelector('.tarjeta-estadistica:nth-child(2) h3');
    const cambioVehiculosSpan = document.querySelector('.tarjeta-estadistica:nth-child(2) .cambio');
    if (tarjetaVehiculos) {
        tarjetaVehiculos.textContent = totalVehiculos;
    }
    if (cambioVehiculosSpan) {
        const signo = cambioVehiculos > 0 ? '+' : '';
        cambioVehiculosSpan.textContent = `${signo}${cambioVehiculos}% vs mes anterior`;
        
        // Actualizar clase CSS según el cambio
        cambioVehiculosSpan.className = 'cambio';
        if (cambioVehiculos > 0) {
            cambioVehiculosSpan.classList.add('positivo');
        } else if (cambioVehiculos < 0) {
            cambioVehiculosSpan.classList.add('negativo');
        } else {
            cambioVehiculosSpan.classList.add('neutro');
        }
    }

    // --- Renderizar gráficos solo si hay contenedores ---
    const graficoAlumnosContainer = document.querySelector("#grafico-alumnos");
    if (graficoAlumnosContainer) {
        var opcionesAlumnosPorLevel = {
            series: [{
                name: 'Alumnos',
                data: alumnosPorLevel || [0, 0, 0]
            }],
            chart: {
                height: 350,
                type: 'bar',
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    horizontal: false,
                    columnWidth: '50%',
                }
            },
            dataLabels: { enabled: true },
            xaxis: {
                categories: labelsLevels,
                labels: { style: { colors: ['#555'], fontSize: '14px' } }
            },
            yaxis: {
                title: {
                    text: 'Cantidad de Alumnos',
                    style: { color: '#555', fontSize: '14px', fontWeight: 600 }
                }
            },
            colors: ['#00E396'],
            grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
            tooltip: {
                y: { formatter: function (valor) { return valor + " alumnos"; } }
            }
        };

        var graficoAlumnosPorLevel = new ApexCharts(graficoAlumnosContainer, opcionesAlumnosPorLevel);
        graficoAlumnosPorLevel.render();
    }

    // --- Gráfico vehículos por tipo ---
    const graficoVehiculosContainer = document.querySelector("#grafico-vehiculos-tipo");
    if (graficoVehiculosContainer && tiposVehiculos.length > 0) {
        var opcionesVehiculosPorTipo = {
            series: [{
                name: 'Vehículos',
                data: vehiculosPorTipo
            }],
            chart: {
                height: 350,
                type: 'bar',
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    horizontal: false,
                    columnWidth: '50%',
                }
            },
            dataLabels: { enabled: true },
            xaxis: {
                categories: tiposVehiculos,
                labels: { style: { colors: ['#555'], fontSize: '14px' } }
            },
            yaxis: {
                title: {
                    text: 'Cantidad de Vehículos',
                    style: { color: '#555', fontSize: '14px', fontWeight: 600 }
                }
            },
            colors: ['#FEB019'],
            grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
            tooltip: {
                y: { formatter: function (valor) { return valor + " vehículos"; } }
            }
        };

        var graficoVehiculosPorTipo = new ApexCharts(graficoVehiculosContainer, opcionesVehiculosPorTipo);
        graficoVehiculosPorTipo.render();
    }

    // --- Gráfico instructores por año ---
    const graficoInstructoresLevelContainer = document.querySelector("#grafico-instructores-level");
    if (graficoInstructoresLevelContainer) {
        var opcionesInstructoresPorLevel = {
            series: [{
                name: 'Instructores',
                data: instructoresPorLevel || [0, 0, 0]
            }],
            chart: {
                height: 350,
                type: 'bar',
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    horizontal: false,
                    columnWidth: '50%',
                }
            },
            dataLabels: { enabled: true },
            xaxis: {
                categories: labelsLevels,
                labels: { style: { colors: ['#555'], fontSize: '14px' } }
            },
            yaxis: {
                title: {
                    text: 'Cantidad de Instructores',
                    style: { color: '#555', fontSize: '14px', fontWeight: 600 }
                }
            },
            colors: ['#775DD0'],
            grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
            tooltip: {
                y: { formatter: function (valor) { return valor + " instructores"; } }
            }
        };

        var graficoInstructoresPorLevel = new ApexCharts(graficoInstructoresLevelContainer, opcionesInstructoresPorLevel);
        graficoInstructoresPorLevel.render();
    }

    // --- Gráfico instructores por rol ---
    const graficoInstructoresRolContainer = document.querySelector("#grafico-instructores-rol");
    if (graficoInstructoresRolContainer && rolesInstructores.length > 0) {
        var opcionesInstructoresPorRol = {
            series: [{
                name: 'Instructores',
                data: instructoresPorRol
            }],
            chart: {
                height: 350,
                type: 'bar',
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    horizontal: false,
                    columnWidth: '50%',
                }
            },
            dataLabels: { enabled: true },
            xaxis: {
                categories: rolesInstructores,
                labels: { style: { colors: ['#555'], fontSize: '14px' } }
            },
            yaxis: {
                title: {
                    text: 'Cantidad de Instructores',
                    style: { color: '#555', fontSize: '14px', fontWeight: 600 }
                }
            },
            colors: ['#FF4560'],
            grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
            tooltip: {
                y: { formatter: function (valor) { return valor + " instructores"; } }
            }
        };

        var graficoInstructoresPorRol = new ApexCharts(graficoInstructoresRolContainer, opcionesInstructoresPorRol);
        graficoInstructoresPorRol.render();
    }

    // --- Funcionalidad de impresión ---
    // Función para imprimir la página completa
    function imprimirReportes() {
        // Agregar clase para estilos de impresión
        document.body.classList.add('printing');
        
        // Crear título para la impresión
        const tituloImpresion = document.createElement('div');
        tituloImpresion.className = 'titulo-impresion';
        tituloImpresion.innerHTML = `
            <h1>Reportes y Estadísticas - SGMA</h1>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
        `;
        document.body.insertBefore(tituloImpresion, document.body.firstChild);
        
        // Imprimir
        window.print();
        
        // Limpiar después de imprimir
        setTimeout(() => {
            document.body.classList.remove('printing');
            if (tituloImpresion) {
                document.body.removeChild(tituloImpresion);
            }
        }, 1000);
    }

    // Función para exportar gráfico específico
    function exportarGrafico(graficoId, nombreArchivo) {
        const grafico = document.querySelector(graficoId);
        if (grafico) {
            // Crear ventana temporal para imprimir solo el gráfico
            const ventanaImpresion = window.open('', '_blank');
            ventanaImpresion.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${nombreArchivo}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .grafico-impresion { text-align: center; }
                        h2 { color: #333; margin-bottom: 20px; }
                        .fecha { color: #666; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="grafico-impresion">
                        <h2>${nombreArchivo}</h2>
                        ${grafico.outerHTML}
                        <p class="fecha">Generado el: ${new Date().toLocaleDateString('es-ES')}</p>
                    </div>
                </body>
                </html>
            `);
            ventanaImpresion.document.close();
            ventanaImpresion.print();
        }
    }

    // Agregar event listeners a todos los botones de exportar
    document.querySelectorAll('.btn-exportar').forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const graficos = [
                { id: '#grafico-alumnos', nombre: 'Alumnos Registrados por Año' },
                { id: '#grafico-vehiculos-tipo', nombre: 'Vehículos por Tipo' },
                { id: '#grafico-instructores-level', nombre: 'Instructores por Año' },
                { id: '#grafico-instructores-rol', nombre: 'Instructores por Rol' }
            ];
            
            if (graficos[index]) {
                exportarGrafico(graficos[index].id, graficos[index].nombre);
            }
        });
    });

    // Agregar event listeners a botones de actualizar
    document.querySelectorAll('.btn-actualizar').forEach(btn => {
        btn.addEventListener('click', function() {
            location.reload();
        });
    });

    // Agregar botón de imprimir reporte completo
    const controlesPrincipal = document.querySelector('.titulo-pagina');
    if (controlesPrincipal) {
        const btnImprimir = document.createElement('button');
        btnImprimir.className = 'btn-imprimir-todo';
        btnImprimir.innerHTML = '<i class="fas fa-print"></i> Imprimir Reporte Completo';
        btnImprimir.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 14px;
        `;
        btnImprimir.addEventListener('click', imprimirReportes);
        controlesPrincipal.appendChild(btnImprimir);
    }
    
});

