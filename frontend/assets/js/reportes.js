document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reportForm");
  const result = document.getElementById("reportResults");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const employeeId = document.getElementById("employeeId").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
      result.innerHTML = "<p style='color:red;'>Debes seleccionar el rango de fechas.</p>";
      return;
    }

    try {
      const params = new URLSearchParams({
        fecha_inicio: startDate,
        fecha_fin: endDate,
      });
      if (employeeId) params.append("id_empleado", employeeId);

      const data = await apiFetch(`/reportes/accesos?${params.toString()}`);
      if (!data.rows.length) {
        result.innerHTML = "<p>No hay registros en ese rango.</p>";
        return;
      }

      result.innerHTML = `
        <p>Total registros: <strong>${data.total}</strong></p>
        <table id="tabla-accesos">
          <thead>
            <tr>
              <th>ID</th><th>Empleado</th><th>Tipo</th><th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${data.rows.map((r) => `
              <tr>
                <td>${r.id_acceso}</td>
                <td>${r.empleado}</td>
                <td>${r.tipo_acceso}</td>
                <td>${r.fecha_hora}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch (err) {
      result.innerHTML = `<p style='color:red;'>${err.message}</p>`;
    }
  });
});
