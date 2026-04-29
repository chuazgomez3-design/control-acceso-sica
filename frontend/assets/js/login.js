document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");

  if (localStorage.getItem("sica_token")) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      localStorage.setItem("sica_token", data.token);
      localStorage.setItem("sica_admin", JSON.stringify(data.admin));
      window.location.href = "index.html";
    } catch (err) {
      errorBox.textContent = err.message;
    }
  });
});
