// =============================================================================
// CONFIGURACIÓN DE LA API
// =============================================================================
const API_CONFIG = {
    baseUrl: 'https://sgma-66ec41075156.herokuapp.com/api/instructorsAuth',
    endpoints: {
        login: '/instructorLogin',
        me: '/meInstructor'
    }
};

// =============================================================================
// SERVICIOS DE AUTENTICACIÓN
// =============================================================================

// Realiza el inicio de sesión con email y password
async function login({ email, password }) {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        credentials: "include", // Importante para cookies
        body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Error de conexión");
        throw new Error(errorText);
    }
    
    return true;
}

// Verifica el estado de autenticación actual
async function me() {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.me}`, {
            credentials: "include"
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        return { authenticated: false };
    } catch (error) {
        return { authenticated: false };
    }
}

// Cierra la sesión del usuario
async function logout() {
    try {
        // Como no tienes endpoint de logout, simplemente limpiamos el estado local
        auth.ok = false;
        auth.user = null;
        
        // Podrías agregar una llamada a tu API si tienes endpoint de logout
        // const response = await fetch(`${API_CONFIG.baseUrl}/logout`, {
        //     method: "POST",
        //     credentials: "include"
        // });
        
        return true;
    } catch {
        return false;
    }
}

// =============================================================================
// ESTADO DE SESIÓN GLOBAL
// =============================================================================
const auth = {
    ok: false,
    user: null
};

// =============================================================================
// CONTROLADOR DE LOGIN
// =============================================================================
function initLoginController() {
    const form = document.getElementById('loginForm') || document.querySelector('form');
    
    if (!form) return;

    // Manejar submit del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener credenciales del formulario
        const email = (document.querySelector('#email, [name=email], input[type=email]')?.value || '').trim();
        const password = document.querySelector('#password, [name=password], input[type=password]')?.value || '';

        // Validación básica
        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor completa todos los campos'
            });
            return;
        }

        const btnIngresar = document.querySelector('#login-btn, button[type="submit"]');
        let originalText;

        try {
            // Desactivar botón y mostrar loading
            if (btnIngresar) {
                originalText = btnIngresar.innerHTML;
                btnIngresar.setAttribute("disabled", "disabled");
                btnIngresar.innerHTML = 'Ingresando...';
            }

            // Realizar login
            await login({ email, password });

            // Verificar sesión
            const info = await me();
            if (info?.authenticated) {
                // Actualizar estado global
                auth.ok = true;
                auth.user = info.instructor;
                
                // Mostrar éxito y redirigir
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Inicio de sesión exitoso',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'coordi-index.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de autenticación'
                });
            }
        } catch (err) {
            console.error('Error en login:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.message || 'No fue posible iniciar sesión.'
            });
        } finally {
            // Restaurar botón
            if (btnIngresar) {
                btnIngresar.removeAttribute("disabled");
                if (originalText) btnIngresar.innerHTML = originalText;
            }
        }
    });

    // Funcionalidad del toggle de contraseña
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }
}

// =============================================================================
// CONTROLADOR DE SESIÓN
// =============================================================================

// Controla qué elementos del menú mostrar según la sesión
function ensureMenuLinks(shouldShow) {
    const loginLink = document.getElementById("loginLink");
    
    if (shouldShow) {
        loginLink?.classList.add("d-none");
        // Aquí puedes agregar más elementos del menú que solo aparezcan cuando esté logueado
    } else {
        loginLink?.classList.remove("d-none");
        // Ocultar elementos que requieren autenticación
    }
}

// Renderiza la información del usuario y ajusta el menú (solo si no estamos en login)
async function renderUser() {
    // No hacer peticiones si estamos en la página de login
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath.includes('login');
    
    if (isLoginPage) {
        return; // No verificar sesión en página de login
    }
    
    const userBox = document.getElementById("userBox");
    
    try {
        const info = await me();
        auth.ok = !!info?.authenticated;
        auth.user = info?.instructor ?? null;

        if (auth.ok && userBox) {
            ensureMenuLinks(true);
            
            // Mostrar información del usuario - corregir los nombres de campos
            const userName = auth.user?.names || auth.user?.firstName || auth.user?.email || "usuario";
            userBox.innerHTML = `
                <span class="me-3">Hola, <strong>${userName}</strong></span>
                <button id="btnLogout" class="btn btn-outline-danger btn-sm">Salir</button>
            `;
            userBox.classList.remove("d-none");

            // Listener para logout
            document.getElementById("btnLogout")?.addEventListener("click", async () => {
                await logout();
                ensureMenuLinks(false);
                window.location.replace("index.html");
            });
        } else {
            auth.ok = false;
            auth.user = null;
            userBox?.classList.add("d-none");
            ensureMenuLinks(false);
        }
    } catch {
        auth.ok = false;
        auth.user = null;
        document.getElementById("userBox")?.classList.add("d-none");
        ensureMenuLinks(false);
    }
}

// Verifica si hay sesión activa y redirige si es necesario
async function requireAuth({ redirect = true } = {}) {
    try {
        const info = await me();
        auth.ok = !!info?.authenticated;
        auth.user = info?.instructor ?? null;
    } catch {
        auth.ok = false;
        auth.user = null;
    }

    if (!auth.ok && redirect) {
        window.location.replace("login.html");
    }
    
    return auth.ok;
}

// Funciones auxiliares para roles
function getUserRole() {
    return auth.user?.role || "";
}

function hasAuthority(authority) {
    return Array.isArray(auth.user?.authorities)
        ? auth.user.authorities.includes(authority)
        : false;
}

const role = {
    isAdmin: () => getUserRole() === "Administrador" || hasAuthority("ROLE_Administrador"),
    isInstructor: () => getUserRole() === "Instructor" || hasAuthority("ROLE_Instructor")
};

// =============================================================================
// INICIALIZACIÓN
// =============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando aplicación...');
    
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath.includes('login');
    
    // Inicializar controlador de login si estamos en la página de login
    if (isLoginPage) {
        initLoginController();
        console.log('Página de login detectada, no se verificará sesión automáticamente');
        return; // Salir temprano, no hacer más verificaciones
    }
    
    // Solo renderizar usuario y verificar autenticación en páginas que NO son de login
    await renderUser();
    
    // Verificar autenticación en páginas protegidas
    const protectedPages = ['coordi-index', 'dashboard', 'admin', 'panel'];
    
    if (protectedPages.some(page => currentPath.includes(page))) {
        console.log('Página protegida detectada, verificando autenticación...');
        await requireAuth();
    }
});

// Solo refrescar sesión en páginas que no son de login
window.addEventListener("pageshow", async (event) => {
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath.includes('login');
    
    if (event.persisted && !isLoginPage) {
        await renderUser();
    }
});

// Exportar funciones principales para uso en otros scripts
window.authService = {
    login,
    logout,
    me,
    requireAuth,
    renderUser,
    auth,
    role
};
