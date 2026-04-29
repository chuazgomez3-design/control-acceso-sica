const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const capturasDiv = document.getElementById("capturas");
const captureBtn = document.getElementById("capture");
const form = document.getElementById("formEmpleado");
const registrarBtn = document.getElementById("registrar");
const resultado = document.getElementById("resultado");

let fotos = [];

// Iniciar cámara
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => alert("Error al acceder a la cámara: " + err));

// Capturar foto
captureBtn.addEventListener("click", () => {
  if (fotos.length >= 5) {
    alert("Solo puedes tomar hasta 5 fotos.");
    return;
  }
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg");
  fotos.push(dataUrl);

  const img = document.createElement("img");
  img.src = dataUrl;
  img.className = "preview-img";
  capturasDiv.appendChild(img);

  if (fotos.length > 0) registrarBtn.disabled = false;
});

// Enviar datos a la API
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const admin = JSON.parse(localStorage.getItem("sica_admin") || "{}");
  const payload = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    direccion: document.getElementById("direccion").value,
    correo: document.getElementById("correo").value,
    id_administrador: Number(admin.id_administrador || document.getElementById("id_admin").value || 1),
    fotos
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/api/empleados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "No fue posible registrar.");
    }
    const data = await res.json();

    resultado.innerHTML = `<p class="${data.status}">${data.message}</p>`;
    if (data.status === "success") {
      form.reset();
      fotos = [];
      capturasDiv.innerHTML = "";
      registrarBtn.disabled = true;
    }
  } catch (err) {
    resultado.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
});
