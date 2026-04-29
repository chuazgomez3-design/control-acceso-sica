// frontend/assets/js/monitoreo_accesos.js
document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.querySelector("#tabla-accesos tbody");
  const estado = document.querySelector("#estadoActualizacion");

  async function cargarAccesos() {
    estado.style.display = "block";
    let data = [];
    try {
      data = await apiFetch("/accesos");
    } catch (err) {
      tabla.innerHTML = `<tr><td colspan='4'>${err.message}</td></tr>`;
      estado.style.display = "none";
      return;
    }

    tabla.innerHTML = "";
    if (data.length === 0) {
      tabla.innerHTML = "<tr><td colspan='4'>No hay registros de accesos.</td></tr>";
    } else {
      data.forEach(a => {
        tabla.innerHTML += `
          <tr>
            <td>${a.id_acceso}</td>
            <td>${a.empleado}</td>
            <td>${a.tipo_acceso}</td>
            <td>${a.fecha_hora}</td>
          </tr>`;
      });
    }
    estado.style.display = "none";
  }

  cargarAccesos();
  setInterval(cargarAccesos, 10000); // Actualiza cada 10s
});
