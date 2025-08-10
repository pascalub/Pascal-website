document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-money-form");
    const message = document.getElementById("message");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const amount = parseFloat(document.getElementById("amount").value);
  
      if (amount <= 0 || isNaN(amount)) {
        message.textContent = "Please enter a valid amount.";
        message.style.color = "red";
        return;
      }
  
      // Update current balance in localStorage
      let currentBalance = parseFloat(localStorage.getItem("currentBalance") || "0");
      currentBalance += amount;
      localStorage.setItem("currentBalance", currentBalance);
  
      message.textContent = `₦${amount.toLocaleString()} added successfully!`;
      message.style.color = "#22c55e";
  
      form.reset();
    });
  });
  