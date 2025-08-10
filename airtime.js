document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("airtime-form");
    const pinModal = document.getElementById("pin-modal");
    const successModal = document.getElementById("success-modal");
    const confirmPinBtn = document.getElementById("confirm-pin");
    const pinInput = document.getElementById("pin-input");
    const pinError = document.getElementById("pin-error");
    const successDetails = document.getElementById("success-details");

    let airtimeData = {};

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        airtimeData = {
            network: document.getElementById("network").value,
            phone: document.getElementById("phone").value,
            amount: parseFloat(document.getElementById("amount").value)
        };
        pinModal.classList.remove("hidden");
    });

    confirmPinBtn.addEventListener("click", () => {
        if (pinInput.value === "2007") {
            saveTransaction();
            pinModal.classList.add("hidden");
            successDetails.textContent = `₦${airtimeData.amount.toLocaleString()} Airtime to ${airtimeData.phone} (${airtimeData.network})`;
            successModal.classList.remove("hidden");
        } else {
            pinError.textContent = "Incorrect PIN";
            pinInput.classList.add("shake");
            setTimeout(() => pinInput.classList.remove("shake"), 500);
        }
    });

    function saveTransaction() {
        let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        transactions.push({
            type: "Airtime",
            network: airtimeData.network,
            phone: airtimeData.phone,
            amount: airtimeData.amount,
            date: new Date().toLocaleString(),
            id: Math.floor(Math.random() * 1000000000)
        });
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // Deduct from current balance
        let currentBalance = parseFloat(localStorage.getItem("currentBalance") || 150000);
        currentBalance -= airtimeData.amount;
        localStorage.setItem("currentBalance", currentBalance);
    }
}); on