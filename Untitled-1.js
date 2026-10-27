// ১. পাসওয়ার্ড দেখা বা লুকানোর কাজ (Toggle Password View)
function togglePassword() {
  var passwordInput = document.getElementById("password");
  
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}

// ২. এরর বক্স বন্ধ করার কাজ (Close Error Box)
function closeError() {
  var errorBox = document.getElementById("errorBox");
  errorBox.style.display = "none";
}

// ৩. ফর্ম সাবমিট করার হ্যান্ডলার (Form Submit Handler)
function handleLogin(event) {
  // পেজ রিফ্রেশ হওয়া বন্ধ করে
  event.preventDefault(); 
  
  var codename = document.getElementById("codename").value;
  alert("Logging in as: " + codename);
}