import { me } from "./service/authService.js";

// Verifica si el instructor está autenticado usando me() de authService.js.
// Si no está autenticado redirige al index. Conectar este script en cada página
// usando <script type="module" src="/js/auth-verify.js"></script>

function isIndexPage() {
    const p = location.pathname.split("/").pop();
    // Solo considerar la página index (o la raíz) como pantalla de login
    return p === "" || p === "index.html";
}

async function verifyAuth() {
    // Evitar bucle de redirección si ya estamos en la página de login/index
    if (isIndexPage()) return;

    try {
        const info = await me();
        // Esperamos objeto con { authenticated: true, instructor: {...} }
        if (!info || !info.authenticated) {
            console.log('Usuario no autenticado, redirigiendo...');
            // Redirigir al index de la aplicación
            window.location.href = "/index.html";
            return;
        }

        // Opcional: exponer datos del instructor globalmente para otras partes de la app
        window.SGMA = window.SGMA || {};
        window.SGMA.instructor = info.instructor || null;
        console.log('Usuario autenticado:', info.instructor);

    } catch (e) {
        console.error('Error en verificación de autenticación:', e);
        // En caso de error de red o inesperado, también redirigimos al index
        window.location.href = "/index.html";
    }
}

// Ejecutar verificación inmediatamente
verifyAuth();

export { verifyAuth };
