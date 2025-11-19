// Optional password toggle feature
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
togglePassword?.addEventListener("click", () => {
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
});

function validateForm(e) {
  const name = document.getElementById("classificationName").value.trim();
  if (!/^[A-Za-z0-9]+$/.test(name)) {
    e.preventDefault();
    const err = document.getElementById("clientError");
    err.textContent = "No spaces or special characters allowed.";
  }
}

document.getElementById("inventoryForm")?.addEventListener("submit", validate);
