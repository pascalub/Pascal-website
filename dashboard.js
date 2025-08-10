document.addEventListener("DOMContentLoaded", () => {
    // Load stored balances or default
    let currentBalance = localStorage.getItem("currentBalance") || 150000;
    let savingsBalance = localStorage.getItem("savingsBalance") || 300000;

    document.getElementById("current-balance").textContent = parseFloat(currentBalance).toLocaleString();
    document.getElementById("savings-balance").textContent = parseFloat(savingsBalance).toLocaleString();
});

(() => {
    const cardNumberEl = document.getElementById("card-number");
    const maskToggle = document.getElementById("mask-toggle");
  
    // Full card number (fake)
    const fullNumber = "1234 5678 9012 3456";
  
    // Masked format: **** **** **** 3456
    const maskedNumber = "**** **** **** 3456";
  
    let masked = true;
  
    function updateCardNumber() {
      cardNumberEl.textContent = masked ? maskedNumber : fullNumber;
      maskToggle.textContent = masked ? "Show" : "Hide";
      maskToggle.setAttribute("aria-pressed", !masked);
    }
  
    maskToggle.addEventListener("click", () => {
      masked = !masked;
      updateCardNumber();
    });
  
    maskToggle.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        masked = !masked;
        updateCardNumber();
      }
    });
  
    updateCardNumber();
  })();