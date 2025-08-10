document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("settings-form");
    const message = document.getElementById("form-message");
    const usernameInput = document.getElementById("username");
    const phoneInput = document.getElementById("contact-phone");
    const emailInput = document.getElementById("contact-email");
    const profilePicInput = document.getElementById("profile-pic");
    const profilePicPreview = document.getElementById("profile-pic-preview");
  
    const oldPasswordInput = document.getElementById("old-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
  
    const oldPinInput = document.getElementById("old-pin");
    const newPinInput = document.getElementById("new-pin");
    const confirmPinInput = document.getElementById("confirm-pin");
  
    // Load saved data from localStorage
    function loadSettings() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      usernameInput.value = user.username || "Pascal ubah";
      phoneInput.value = user.phone || "";
      emailInput.value = user.email || "";
      if (user.profilePic) {
        profilePicPreview.src = user.profilePic;
      }
    }
  
    loadSettings();
  
    // Profile picture preview update
    profilePicInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          profilePicPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      message.textContent = "";
      message.className = "";
  
      const user = JSON.parse(localStorage.getItem("user")) || {};
  
      // Validate username
      if (!usernameInput.value.trim()) {
        message.textContent = "Username cannot be empty.";
        message.className = "error-msg";
        return;
      }
  
      // Validate phone number pattern (optional)
      if (phoneInput.value && !phoneInput.validity.valid) {
        message.textContent = "Please enter a valid Nigerian phone number (+234XXXXXXXXXX).";
        message.className = "error-msg";
        return;
      }
  
      // Validate email (optional)
      if (emailInput.value && !emailInput.validity.valid) {
        message.textContent = "Please enter a valid email address.";
        message.className = "error-msg";
        return;
      }
  
      // Password change logic
      if (oldPasswordInput.value || newPasswordInput.value || confirmPasswordInput.value) {
        const savedPassword = user.password || "helpme12@";
        if (oldPasswordInput.value !== savedPassword) {
          message.textContent = "Current password is incorrect.";
          message.className = "error-msg";
          return;
        }
        if (newPasswordInput.value !== confirmPasswordInput.value) {
          message.textContent = "New passwords do not match.";
          message.className = "error-msg";
          return;
        }
        if (newPasswordInput.value.length < 6) {
          message.textContent = "New password must be at least 6 characters.";
          message.className = "error-msg";
          return;
        }
        user.password = newPasswordInput.value;
      }
  
      // PIN change logic
      if (oldPinInput.value || newPinInput.value || confirmPinInput.value) {
        const savedPin = user.pin || "2007";
        if (oldPinInput.value !== savedPin) {
          message.textContent = "Current PIN is incorrect.";
          message.className = "error-msg";
          return;
        }
        if (newPinInput.value !== confirmPinInput.value) {
          message.textContent = "New PINs do not match.";
          message.className = "error-msg";
          return;
        }
        if (!/^\d{4}$/.test(newPinInput.value)) {
          message.textContent = "New PIN must be exactly 4 digits.";
          message.className = "error-msg";
          return;
        }
        user.pin = newPinInput.value;
      }
  
      // Save profile pic (base64)
      if (profilePicPreview.src && !profilePicPreview.src.startsWith("default-profile.png")) {
        user.profilePic = profilePicPreview.src;
      }
  
      // Save contact info and username
      user.username = usernameInput.value.trim();
      user.phone = phoneInput.value.trim();
      user.email = emailInput.value.trim();
  
      // Save back to localStorage
      localStorage.setItem("user", JSON.stringify(user));
  
      message.textContent = "Settings saved successfully!";
      message.className = "success-msg";
  
      // Clear password and PIN fields
      oldPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
      oldPinInput.value = "";
      newPinInput.value = "";
      confirmPinInput.value = "";
    });
  });
  