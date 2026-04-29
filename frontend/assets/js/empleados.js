document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.querySelector("#tabla-accesos tbody");
  if (!tbody) return;

  try {
    const empleados = await apiFetch("/empleados");
    if (!empleados.length) {
      tbody.innerHTML = "<tr><td colspan='6'>No hay empleados registrados.</td></tr>";
      return;
    }
    tbody.innerHTML = empleados
      .map((e) => `
        <tr>
          <td>${e.id_empleado}</td>
          <td>${e.nombre}</td>
          <td>${e.apellido}</td>
          <td>${e.correo}</td>
          <td>${e.direccion}</td>
          <td>${e.fecha_registro || ""}</td>
        </tr>
      `)
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='6'>${err.message}</td></tr>`;
  }
});
