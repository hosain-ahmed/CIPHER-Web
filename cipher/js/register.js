const form = document.getElementById("registerForm");
const codename = document.getElementById("codename");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const codenameStatus = document.getElementById("codenameStatus");
const successMessage = document.getElementById("successMessage");

const takenCodenames = ["admin", "root", "agent007"];

function setError(input, message) {
  const errorBox = document.getElementById(input.id + "Error");
  errorBox.textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.classList.toggle("valid", message === "");
  return message === "";
}

function checkCodename() {
  const value = codename.value.trim();
  codenameStatus.textContent = "";
  codenameStatus.className = "status";

  if (!/^[a-zA-Z0-9_]{3,16}$/.test(value)) {
    return setError(codename, "Use 3-16 letters, numbers or underscores.");
  }

  if (takenCodenames.includes(value.toLowerCase()) || CIPHER.findUser(value)) {
    codenameStatus.textContent = "TAKEN";
    codenameStatus.classList.add("bad");
    return setError(codename, "This codename is already taken.");
  }

  codenameStatus.textContent = "AVAILABLE";
  codenameStatus.classList.add("ok");
  return setError(codename, "");
}

function checkFullName() {
  if (fullName.value.trim() === "") {
    return setError(fullName, "Enter your full name.");
  }
  return setError(fullName, "");
}

function checkEmail() {
  if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
    return setError(email, "Enter a valid email address.");
  }
  return setError(email, "");
}

function checkPassword() {
  const value = password.value;

  if (value.length < 8 || !/\d/.test(value)) {
    return setError(password, "Needs 8+ characters and at least 1 digit.");
  }

  return setError(password, "");
}

function checkConfirmPassword() {
  if (confirmPassword.value === "" || confirmPassword.value !== password.value) {
    return setError(confirmPassword, "Passwords do not match.");
  }

  return setError(confirmPassword, "");
}

function handleSubmit(event) {
  event.preventDefault();
  successMessage.textContent = "";

  const results = [
    checkCodename(),
    checkFullName(),
    checkEmail(),
    checkPassword(),
    checkConfirmPassword()
  ];

  if (results.includes(false)) {
    return;
  }

  const newUser = {
    codename: codename.value.trim(),
    fullName: fullName.value.trim(),
    email: email.value.trim(),
    role: "user",
    status: "Active",
    xp: 0,
    coins: 100
  };

  CIPHER.saveUser(newUser);

  try {
    localStorage.setItem("cipherRegisteredCodename", newUser.codename);
  } catch (error) {
    console.warn("Could not save the registered codename", error);
  }

  successMessage.textContent = "Account created. Redirecting to sign in...";
  form.reset();

  document.querySelectorAll("input").forEach(function (input) {
    input.classList.remove("valid", "invalid");
  });
  codenameStatus.textContent = "";

  setTimeout(function () {
    window.location.href = "login.html";
  }, 900);
}

codename.addEventListener("input", checkCodename);
fullName.addEventListener("input", checkFullName);
email.addEventListener("input", checkEmail);
password.addEventListener("input", checkPassword);
confirmPassword.addEventListener("input", checkConfirmPassword);

form.addEventListener("submit", handleSubmit);
