document.addEventListener("DOMContentLoaded", async () => {
  const empleadoSelect = document.getElementById("empleado");
  const tipoSelect = document.getElementById("tipoAcceso");
  const resultado = document.getElementById("resultado");

  try {
    const empleados = await apiFetch("/empleados");
    empleadoSelect.innerHTML = "<option value=''>Selecciona empleado</option>" +
      empleados.map((e) => (
        `<option value="${e.id_empleado}">${e.id_empleado} - ${e.nombre} ${e.apellido}</option>`
      )).join("");
  } catch (err) {
    resultado.textContent = err.message;
    resultado.style.color = "red";
  }

  window.getTipoAcceso = () => tipoSelect.value;
});
