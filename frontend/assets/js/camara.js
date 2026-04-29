const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("No se pudo acceder a la cámara: " + err);
  }
}
startCamera();

captureBtn.addEventListener("click", async () => {
  const empleadoId = document.getElementById("empleado").value;
  if (!empleadoId) {
    alert("Selecciona un empleado antes de continuar");
    return;
  }

  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const base64Image = canvas.toDataURL("image/jpeg");

  verificarAcceso(empleadoId, base64Image);
});
