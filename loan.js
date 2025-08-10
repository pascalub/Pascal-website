document.addEventListener("DOMContentLoaded", () => {
    const loanForm = document.getElementById("loan-form");
    const loading = document.getElementById("loading");
    const loanModal = document.getElementById("loan-modal");
    const modalAmount = document.getElementById("modal-amount");
    const modalTerm = document.getElementById("modal-term");
    const modalPurpose = document.getElementById("modal-purpose");
    const closeModalBtn = document.getElementById("close-modal");
  
    loanForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      // Validate inputs again just in case
      const amount = parseFloat(document.getElementById("loan-amount").value);
      const term = document.getElementById("loan-term").value;
      const purpose = document.getElementById("loan-purpose").value;
  
      if (!amount || amount < 1000) {
        alert("Please enter a valid loan amount of at least ₦1000.");
        return;
      }
      if (!term) {
        alert("Please select a loan term.");
        return;
      }
      if (!purpose) {
        alert("Please select a loan purpose.");
        return;
      }
  
      // Show loading animation/message
      loading.style.display = "block";
  
      // Simulate approval delay (2.5 seconds)
      setTimeout(() => {
        loading.style.display = "none";
  
        // Display modal with info
        modalAmount.textContent = amount.toLocaleString();
        modalTerm.textContent = term;
        modalPurpose.textContent = purpose;
  
        loanModal.classList.add("show");
  
        // Save loan application to localStorage (optional)
        saveLoanApplication({ amount, term, purpose, date: new Date().toLocaleString() });
  
      }, 2500);
    });
  
    closeModalBtn.addEventListener("click", () => {
      loanModal.classList.remove("show");
      loanForm.reset();
    });
  
    function saveLoanApplication(loan) {
      const loans = JSON.parse(localStorage.getItem("loans")) || [];
      loans.push(loan);
      localStorage.setItem("loans", JSON.stringify(loans));
    }
});