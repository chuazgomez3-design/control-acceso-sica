// js/api_requests.js
async function verificarAcceso(id_empleado, imagenBase64) {
  const resultado = document.getElementById("resultado");

  resultado.textContent = "Verificando rostro...";
  resultado.style.color = "#555";

  try {
    const response = await fetch("http://127.0.0.1:8000/api/accesos/validar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        id_empleado: id_empleado,
        imagen: imagenBase64,
        tipo_acceso: typeof window.getTipoAcceso === "function" ? window.getTipoAcceso() : "Entrada",
      })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Error validando acceso.");
    }
    const data = await response.json();

    if (data.status === "success") {
      resultado.textContent = "✅ Acceso permitido";
      resultado.style.color = "green";
    } else {
      resultado.textContent = "❌ Acceso denegado";
      resultado.style.color = "red";
    }

  } catch (err) {
    resultado.textContent = "⚠️ Error de conexión con el servidor";
    resultado.style.color = "orange";
  }
}
