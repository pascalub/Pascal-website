document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("transfer-form");
    const pinModal = document.getElementById("pin-modal");
    const successModal = document.getElementById("success-modal");
    const confirmPinBtn = document.getElementById("confirm-pin");
    const pinInput = document.getElementById("pin-input");
    const pinError = document.getElementById("pin-error");
    const successDetails = document.getElementById("success-details");
  
    let transferData = {};
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      transferData = {
        recipientName: document.getElementById("recipient-name").value.trim(),
        accountNumber: document.getElementById("account-number").value.trim(),
        bank: document.getElementById("bank-select").value,
        amount: parseFloat(document.getElementById("transfer-amount").value),
      };
      pinModal.classList.remove("hidden");
      pinInput.value = "";
      pinError.textContent = "";
      pinInput.focus();
    });
  
    confirmPinBtn.addEventListener("click", () => {
      if (pinInput.value === "2007") {
        if (transferData.amount > parseFloat(localStorage.getItem("currentBalance") || "0")) {
          pinError.textContent = "Insufficient balance";
          return;
        }
        saveTransaction();
        pinModal.classList.add("hidden");
        successDetails.innerHTML = `
          ₦${transferData.amount.toLocaleString()} transferred to ${transferData.recipientName} <br />
          Bank: ${transferData.bank} <br />
          Account No: ${transferData.accountNumber} <br />
          Transaction ID: ${generateTxId()} <br />
          Date: ${new Date().toLocaleString()}
        `;
        successModal.classList.remove("hidden");
      } else {
        pinError.textContent = "Incorrect PIN";
        pinInput.classList.add("shake");
        setTimeout(() => pinInput.classList.remove("shake"), 500);
      }
    });
  
    function generateTxId() {
      return (
        "ZP-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 8).toUpperCase()
      );
    }
  
    function saveTransaction() {
      let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
      transactions.push({
        type: "Transfer",
        recipientName: transferData.recipientName,
        accountNumber: transferData.accountNumber,
        bank: transferData.bank,
        amount: transferData.amount,
        date: new Date().toLocaleString(),
        id: generateTxId(),
      });
      localStorage.setItem("transactions", JSON.stringify(transactions));
  
      // Deduct from current balance
      let currentBalance = parseFloat(localStorage.getItem("currentBalance") || "0");
      currentBalance -= transferData.amount;
      localStorage.setItem("currentBalance", currentBalance);
    }
  });