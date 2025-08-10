document.addEventListener("DOMContentLoaded", () => {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const transactionList = document.getElementById("transaction-list");
    const filterButtons = document.querySelectorAll(".filters button");
    const modal = document.getElementById("modal");
    const modalDesc = document.getElementById("modal-desc");
    const printBtn = document.getElementById("print-btn");
  
    // Classify transaction types as credit or debit for filtering
    function getTransactionType(t) {
      if (t.type === "AddMoney" || t.type === "Credit") return "credit";
      if (t.type === "Transfer" || t.type === "Airtime" || t.type === "Debit") return "debit";
      return "credit"; // fallback
    }
  
    function renderTransactions(filter = "all") {
      transactionList.innerHTML = "";
      let filtered = transactions.filter(tx => filter === "all" || getTransactionType(tx) === filter);
      if(filtered.length === 0){
        transactionList.innerHTML = `<p style="color:#aaa; padding:1rem;">No transactions to show.</p>`;
        return;
      }
      filtered.forEach(tx => {
        const item = document.createElement("div");
        item.classList.add("transaction-item");
        item.classList.add(getTransactionType(tx) === "credit" ? "transaction-type-credit" : "transaction-type-debit");
        item.tabIndex = 0;
        item.innerHTML = `
          <div><strong>${tx.type}</strong> - ${tx.date}</div>
          <div>₦${tx.amount.toLocaleString()}</div>
        `;
        item.addEventListener("click", () => openModal(tx));
        item.addEventListener("keydown", e => {
          if (e.key === "Enter") openModal(tx);
        });
        transactionList.appendChild(item);
      });
    }
  
    function openModal(tx) {
      modalDesc.innerHTML = `
        <p><strong>Transaction ID:</strong> ${tx.id || "N/A"}</p>
        <p><strong>Type:</strong> ${tx.type}</p>
        <p><strong>Date & Time:</strong> ${tx.date}</p>
        <p><strong>Amount:</strong> ₦${tx.amount.toLocaleString()}</p>
        ${tx.recipientName ? `<p><strong>Recipient:</strong> ${tx.recipientName}</p>` : ""}
        ${tx.accountNumber ? `<p><strong>Account No:</strong> ${tx.accountNumber}</p>` : ""}
        ${tx.bank ? `<p><strong>Bank:</strong> ${tx.bank}</p>` : ""}
        ${tx.network ? `<p><strong>Network:</strong> ${tx.network}</p>` : ""}
        ${tx.phone ? `<p><strong>Phone:</strong> ${tx.phone}</p>` : ""}
        ${tx.purpose ? `<p><strong>Purpose:</strong> ${tx.purpose}</p>` : ""}
      `;
      modal.classList.remove("hidden");
    }
  
    function closeModal() {
      modal.classList.add("hidden");
    }
  
    printBtn.addEventListener("click", () => {
      window.print();
    });
  
    // Filter button events
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTransactions(btn.getAttribute("data-filter"));
      });
    });
  
    // Initial render
    renderTransactions();
  
    // Expose closeModal to global so onclick can call it
    window.closeModal = closeModal;
  });