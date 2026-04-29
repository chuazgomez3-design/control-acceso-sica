function isAuthenticated() {
  return Boolean(localStorage.getItem("sica_token"));
}

function redirectToLogin() {
  localStorage.removeItem("sica_token");
  localStorage.removeItem("sica_admin");
  window.location.replace("iniciar_sesion.html");
}

function requireAuth() {
  if (!isAuthenticated()) {
    redirectToLogin();
  }
}

function installSessionGuards() {
  const isLoginPage = window.location.pathname.endsWith("/iniciar_sesion.html")
    || window.location.pathname.endsWith("iniciar_sesion.html");
  if (isLoginPage) return;

  window.addEventListener("pageshow", () => {
    if (!isAuthenticated()) redirectToLogin();
  });

  window.addEventListener("popstate", () => {
    if (!isAuthenticated()) redirectToLogin();
  });
}

function logoutAndRedirect() {
  const token = localStorage.getItem("sica_token");
  if (token) {
    fetch("http://127.0.0.1:8000/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.setItem("logout", String(Date.now()));
  redirectToLogin();
}

installSessionGuards();
