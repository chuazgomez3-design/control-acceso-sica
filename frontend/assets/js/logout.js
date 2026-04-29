window.addEventListener("DOMContentLoaded", () => {
  const logoutButtons = document.querySelectorAll(".logout");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("logout", String(Date.now()));
      logoutAndRedirect();
    });
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === "logout") {
    localStorage.removeItem("sica_token");
    localStorage.removeItem("sica_admin");
    window.location.replace("iniciar_sesion.html");
  }
});
