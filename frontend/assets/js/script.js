document.addEventListener("DOMContentLoaded", () => {
  const toggleTheme = document.getElementById("toggleTheme");
  const currentDate = document.getElementById("currentDate");
  const currentTime = document.getElementById("currentTime");

  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      toggleTheme.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    });
  }

  function updateDateTime() {
    const now = new Date();
    if (currentDate) currentDate.textContent = now.toLocaleDateString("es-MX");
    if (currentTime) currentTime.textContent = now.toLocaleTimeString("es-MX");
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
});


