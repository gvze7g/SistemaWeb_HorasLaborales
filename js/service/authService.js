// URL base para los endpoints de autenticación de instructores
const API_AUTH = "https://sgma-66ec41075156.herokuapp.com/api/instructorsAuth";
const API_INSTRUCTORS = "https://sgma-66ec41075156.herokuapp.com/api/instructors";

// Realiza el inicio de sesión con email y password
export async function login({ email, password }) {
  const r = await fetch(`${API_AUTH}/instructorLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // incluye cookies en la solicitud
    body: JSON.stringify({ email, password }), // credenciales en el cuerpo
  });
  if (!r.ok) throw new Error(await r.text().catch(() => "")); // lanza error si falla
  return true; // devuelve true en caso de éxito
}

// Verifica el estado de autenticación actual
export async function me() {
  const info = await fetch(`${API_AUTH}/meInstructor`, {
    credentials: "include"
  });

  console.log("Estado de autenticación:", info);

  // Manejo manual de redirección
  if (info.status === 302) {
    const redirectUrl = info.headers.get("coordi-index.html");
    console.log("Redirigiendo manualmente a:", redirectUrl);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
    return { authenticated: false };
  }

  return info.ok ? info.json() : { authenticated: false };
}

// Cierra la sesión del usuario
export async function logout() {
  try {
    // Como no tienes endpoint de logout específico, solo limpiamos localmente
    // Si agregas endpoint de logout en el futuro, descomenta las siguientes líneas:
     const r = await fetch(`${API_AUTH}/logoutInstructor`, {
      method: "POST",
       credentials: "include",
     });
    return r.ok;
    return true;
  } catch {
    return false; // false en caso de error de red u otro fallo
  }
}

// Cambia la contraseña del instructor
export async function changePassword(instructorId) {
  const r = await fetch(`${API_INSTRUCTORS}/update/${instructorId}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });
  
  if (!r.ok) throw new Error(await r.text().catch(() => "Error al cambiar contraseña"));
  return r.json();
}
