/*
  NairaTrust Bank — demo app
  - Demo credentials: username: Pascal  password: Helpmr12@
  - Transaction PIN for any money-moving op: 2007

  Everything is client-side for demo purposes. Data persisted in localStorage.
*/

(() => {
    // ---------- Demo config ----------
    const DEMO_USER = { username: "Pascal", password: "Helpmr12@" };
    const DEMO_PIN = "2007";
    const STORAGE = {
      BALANCE: "nairatrust_balance",
      TXNS: "nairatrust_txns",
      SESSION: "nairatrust_session",
      VAULTS: "nairatrust_vaults",
      PASSWORD: "nairatrust_password" // to change password in demo
    };
  
    // ---------- Utilities ----------
    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
    const fmt = n => "₦" + Number(n).toLocaleString();
    const now = () => new Date().toISOString();
  
    // ---------- App state ----------
    let state = {
      balance: Number(localStorage.getItem(STORAGE.BALANCE) || 50000), // default demo balance
      txns: JSON.parse(localStorage.getItem(STORAGE.TXNS) || "[]"),
      session: JSON.parse(localStorage.getItem(STORAGE.SESSION) || "null"),
      vaults: JSON.parse(localStorage.getItem(STORAGE.VAULTS) || "[]"),
      pendingAction: null, // used to hold action that waits for PIN
    };
  
    // ---------- DOM refs ----------
    const pages = {
      login: $("#page-login"),
      dashboard: $("#page-dashboard"),
      transfer: $("#page-transfer"),
      addMoney: $("#page-add-money"),
      airtime: $("#page-airtime"),
      transactions: $("#page-transactions"),
      vault: $("#page-vault"),
      settings: $("#page-settings")
    };
  
    const loginForm = $("#loginForm");
    const loginUsername = $("#loginUsername");
    const loginPassword = $("#loginPassword");
    const logoutBtn = $("#logoutBtn");
    const logoutBtn2 = $("#logoutBtn2");
    const themeToggle = $("#themeToggle");
  
    const balanceDisplay = $("#balanceDisplay");
    const recentList = $("#recentList");
    const txnPreview = $("#txnPreview");
    const txnTableWrap = $("#txnTableWrap");
    const txnFilter = $("#txnFilter");
    const exportCsv = $("#exportCsv");
  
    const menuButtons = $$(".menu-item");
    const goButtons = $$(".go");
  
    const previewBtn = $("#previewBtn");
    const quickTransfer = $("#quickTransfer");
    const quickAdd = $("#quickAdd");
  
    // Transfer form refs
    const transferForm = $("#transferForm");
    const transferChannel = $("#transferChannel");
    const benefName = $("#benefName");
    const benefAccount = $("#benefAccount");
    const transferAmount = $("#transferAmount");
    const transferNote = $("#transferNote");
  
    // Add money
    const addMoneyForm = $("#addMoneyForm");
    const addMethod = $("#addMethod");
    const addAmount = $("#addAmount");
  
    // Airtime
    const airtimeForm = $("#airtimeForm");
    const airtimeNumber = $("#airtimeNumber");
    const airtimeAmount = $("#airtimeAmount");
  
    // PIN modal
    const pinModal = $("#pinModal");
    const pinInput = $("#pinInput");
    const pinConfirm = $("#pinConfirm");
    const pinCancel = $("#pinCancel");
    const pinError = $("#pinError");
  
    // Vault
    const vaultForm = $("#vaultForm");
    const vaultName = $("#vaultName");
    const vaultAmount = $("#vaultAmount");
    const vaultList = $("#vaultList");
    const vaultStatus = $("#vaultStatus");
  
    // Settings change password
    const changePassForm = $("#changePassForm");
    const curPass = $("#curPass");
    const newPass = $("#newPass");
  
    // Toast
    const toast = $("#toast");
  
    // ---------- Initialization ----------
    function saveState() {
      localStorage.setItem(STORAGE.BALANCE, String(state.balance));
      localStorage.setItem(STORAGE.TXNS, JSON.stringify(state.txns));
      localStorage.setItem(STORAGE.SESSION, JSON.stringify(state.session));
      localStorage.setItem(STORAGE.VAULTS, JSON.stringify(state.vaults));
    }
  
    function showToast(msg, ms = 2500) {
      toast.textContent = msg;
      toast.classList.remove("hide");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.add("hide"), ms);
    }
  
    function formatTxnRow(tx) {
      const date = new Date(tx.time).toLocaleString();
      const sign = tx.type === "credit" ? "+" : "-";
      return `
        <div class="txn-row">
          <div>
            <div style="font-weight:700">${tx.title || tx.channel || tx.type}</div>
            <div class="muted small">${tx.to || tx.note || ""} • ${date}</div>
          </div>
          <div class="amount ${tx.type}">
            ${tx.type === "credit" ? "" : "-"}${fmt(tx.amount)}
          </div>
        </div>
      `;
    }
  
    function renderBalance() {
      balanceDisplay.textContent = fmt(state.balance);
    }
  
    function renderRecent() {
      recentList.innerHTML = "";
      const recent = state.txns.slice().reverse().slice(0,5);
      if (recent.length === 0) {
        recentList.innerHTML = `<li class="muted">No recent activity</li>`;
        txnPreview.innerHTML = `<div class="muted pad">No transactions yet — make your first transfer!</div>`;
        return;
      }
      recent.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<div>
            <div style="font-weight:700">${t.title || t.channel || t.type}</div>
            <div class="muted small">${t.to || t.note || ""}</div>
          </div>
          <div style="text-align:right">
            <div class="amount">${t.type === 'credit' ? '' : '-'}${fmt(t.amount)}</div>
            <div class="muted small">${new Date(t.time).toLocaleDateString()}</div>
          </div>`;
        recentList.appendChild(li);
      });
  
      // preview area
      txnPreview.innerHTML = state.txns.slice().reverse().slice(0,4).map(formatTxnRow).join("");
    }
  
    function renderTransactions(filter = "all") {
      let txs = state.txns.slice().reverse();
      if (filter !== "all") txs = txs.filter(t => t.type === filter || t.channel === filter || t.category === filter);
      if (txs.length === 0) {
        txnTableWrap.innerHTML = `<div class="muted pad">No transactions match this filter.</div>`;
        return;
      }
      txnTableWrap.innerHTML = txs.map(formatTxnRow).join("");
    }
  
    function renderVaults(){
      if (state.vaults.length === 0) {
        vaultList.innerHTML = `<div class="muted">No vaults created. Move money into a vault to lock it away.</div>`;
        vaultStatus.textContent = "No active vault";
        return;
      }
      vaultList.innerHTML = state.vaults.map(v => `<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px">
        <div style="font-weight:700">${v.name} <span style="font-size:12px;color:var(--muted)">• created ${new Date(v.time).toLocaleDateString()}</span></div>
        <div class="muted">Locked: ${fmt(v.amount)}</div>
        </div>`).join("");
      const total = state.vaults.reduce((s,a)=>s+a.amount,0);
      vaultStatus.textContent = `Active vaults • total locked ${fmt(total)}`;
    }
  
    function exportCSV() {
      if (!state.txns.length) {
        showToast("No transactions to export");
        return;
      }
      const header = ["time,type,channel,to,amount,note,id"].join(",") + "\n";
      const rows = state.txns.map(t => [t.time,t.type,t.channel || "", `"${(t.to||"").replace(/"/g,'""')}"`,t.amount, `"${(t.note||"").replace(/"/g,'""')}"`,t.id].join(",")).join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nairatrust_txns_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("CSV exported");
    }
  
    // ---------- Actions ----------
    function performTransaction({ title, amount, type="debit", channel="transfer", to="", note="" }) {
      const id = "tx_" + Date.now();
      const txn = { id, time: now(), amount: Number(amount), type, channel, to, note, title: title || channel };
      if (type === "debit") {
        if (Number(amount) > state.balance) {
          showToast("Insufficient funds");
          return false;
        }
        state.balance -= Number(amount);
      } else {
        state.balance += Number(amount);
      }
      state.txns.push(txn);
      saveState();
      renderBalance();
      renderRecent();
      renderTransactions(txnFilter.value || "all");
      return txn;
    }
  
    // PIN gating system: when an action requires PIN, set state.pendingAction then show PIN modal.
    function askForPin(actionObj) {
      state.pendingAction = actionObj;
      pinInput.value = "";
      pinError.textContent = "";
      pinModal.classList.remove("hide");
      pinInput.focus();
    }
  
    function confirmPinAndProceed() {
      const val = pinInput.value.trim();
      if (!val) {
        pinError.textContent = "Enter PIN";
        return;
      }
      if (val !== DEMO_PIN) {
        pinError.textContent = "Incorrect PIN";
        return;
      }
      pinModal.classList.add("hide");
      const act = state.pendingAction;
      state.pendingAction = null;
  
      if (act && act.type === "transfer") {
        const ok = performTransaction({
          title: `Transfer to ${act.to}`,
          amount: act.amount,
          type: "debit",
          channel: act.channel,
          to: `${act.to} (${act.account})`,
          note: act.note
        });
        if (ok) showToast(`Transfer successful: ${fmt(act.amount)}`);
        goTo("dashboard");
      } else if (act && act.type === "airtime") {
        const ok = performTransaction({
          title: `Airtime ${act.to}`,
          amount: act.amount,
          type: "debit",
          channel: "airtime",
          to: act.to,
          note: "Airtime purchase"
        });
        if (ok) showToast(`Airtime purchased ${fmt(act.amount)}`);
        goTo("dashboard");
      } else if (act && act.type === "vault") {
        const amt = Number(act.amount);
        if (amt > state.balance) {
          showToast("Insufficient balance for vault move");
          return;
        }
        state.balance -= amt;
        const v = { id: "v_" + Date.now(), name: act.name, amount: amt, time: now() };
        state.vaults.push(v);
        state.txns.push({ id: "tx_" + Date.now(), time: now(), amount: amt, type: "debit", channel: "vault", to: act.name, note: "Moved to vault" });
        saveState();
        renderBalance();
        renderVaults();
        renderRecent();
        showToast(`Moved ${fmt(amt)} to vault ${act.name}`);
        goTo("vault");
      } else if (act && act.type === "addMoneyConfirm") {
        // add money confirmed; credit amount
        state.txns.push({ id: "tx_" + Date.now(), time: now(), amount: Number(act.amount), type: "credit", channel: "topup", to: "Top-up", note: act.method });
        state.balance += Number(act.amount);
        saveState();
        renderBalance();
        renderRecent();
        showToast(`Added ${fmt(act.amount)} to your account`);
        goTo("dashboard");
      } else {
        console.warn("Unknown pending action", act);
      }
    }
  
    // ---------- Routing ----------
    function hideAllPages() {
      Object.values(pages).forEach(p => p.classList.remove("active"));
    }
  
    function goTo(target) {
      hideAllPages();
      // mapping simple ids
      const map = {
        dashboard: pages.dashboard,
        transfer: pages.transfer,
        "add-money": pages.addMoney,
        airtime: pages.airtime,
        transactions: pages.transactions,
        vault: pages.vault,
        settings: pages.settings
      };
      if (map[target]) {
        map[target].classList.add("active");
        // highlight menu
        $$(".menu-item").forEach(btn => btn.classList.toggle("active", btn.dataset.target === target));
      } else if (target === "login") {
        pages.login.classList.add("active");
      } else {
        console.warn("Unknown route", target);
      }
    }
  
    // ---------- Event wiring ----------
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = loginUsername.value.trim();
      const p = loginPassword.value;
      const storedPass = localStorage.getItem(STORAGE.PASSWORD) || DEMO_USER.password;
      if (u === DEMO_USER.username && p === storedPass) {
        state.session = { user: u, time: now() };
        localStorage.setItem(STORAGE.SESSION, JSON.stringify(state.session));
        showToast("Login successful");
        // show dashboard
        goTo("dashboard");
        // reveal logout button
        $("#logoutBtn").classList.remove("hide");
        $("#logoutBtn").textContent = "Logout";
        renderAllUI();
      } else {
        showToast("Invalid credentials");
      }
    });
  
    previewBtn.addEventListener("click", (e) => {
      // preview (no session)
      showToast("Preview mode — actions that move money will still use PIN");
      goTo("dashboard");
      renderAllUI();
    });
  
    // menu nav
    menuButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const t = btn.dataset.target;
        goTo(t);
      });
    });
  
    goButtons.forEach(b => {
      b.addEventListener("click", (e) => {
        const t = b.dataset.target;
        goTo(t);
      });
    });
  
    quickTransfer.addEventListener("click", () => goTo("transfer"));
    quickAdd.addEventListener("click", () => goTo("add-money"));
  
    // logout
    $("#logoutBtn").addEventListener("click", () => {
      state.session = null;
      localStorage.removeItem(STORAGE.SESSION);
      showToast("Logged out");
      goTo("login");
    });
    logoutBtn2 && logoutBtn2.addEventListener("click", () => {
      state.session = null;
      localStorage.removeItem(STORAGE.SESSION);
      showToast("Logged out");
      goTo("login");
    });
  
    // theme toggle (simple)
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      showToast("Theme toggled");
    });
  
    // Transfer flow
    transferForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const channel = transferChannel.value;
      const to = benefName.value.trim();
      const account = benefAccount.value.trim();
      const amount = Number(transferAmount.value);
      const note = transferNote.value.trim();
      if (!to || !account || !amount || amount <= 0) {
        showToast("Please fill transfer details");
        return;
      }
      // set pending action
      askForPin({ type: "transfer", channel, to, account, amount, note });
    });
    $("#transferCancel").addEventListener("click", () => goTo("dashboard"));
  
    // Add money
    addMoneyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const method = addMethod.value;
      const amount = Number(addAmount.value);
      if (!amount || amount <= 0) return showToast("Enter an amount");
      // simulate immediate confirmation via PIN-less flow (or you can require PIN). We'll require a confirm for realism:
      askForPin({ type: "addMoneyConfirm", method, amount });
    });
    $("#addCancel").addEventListener("click", () => goTo("dashboard"));
  
    // Airtime
    airtimeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const number = airtimeNumber.value.trim();
      const amount = Number(airtimeAmount.value);
      if (!number || !amount || amount <= 0) return showToast("Fill airtime details");
      askForPin({ type: "airtime", to: number, amount });
    });
    $("#airtimeCancel").addEventListener("click", () => goTo("dashboard"));
  
    // PIN modal actions
    pinConfirm.addEventListener("click", confirmPinAndProceed);
    pinCancel.addEventListener("click", () => {
      pinModal.classList.add("hide");
      state.pendingAction = null;
    });
    pinInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") confirmPinAndProceed();
    });
  
    // transactions filter + export
    txnFilter.addEventListener("change", (e) => renderTransactions(e.target.value));
    exportCsv.addEventListener("click", exportCSV);
  
    // Vault
    vaultForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = vaultName.value.trim();
      const amount = Number(vaultAmount.value);
      if (!name || !amount || amount <= 0) return showToast("Enter valid vault details");
      // require PIN to move money
      askForPin({ type: "vault", name, amount });
    });
  
    // password change (demo)
    changePassForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const cur = curPass.value;
      const nw = newPass.value;
      const stored = localStorage.getItem(STORAGE.PASSWORD) || DEMO_USER.password;
      if (cur !== stored) return showToast("Current password incorrect");
      localStorage.setItem(STORAGE.PASSWORD, nw);
      showToast("Password updated (demo only)");
      curPass.value = ""; newPass.value = "";
    });
  
    // quick helpers for UI
    function renderAllUI() {
      renderBalance();
      renderRecent();
      renderTransactions(txnFilter.value || "all");
      renderVaults();
    }
  
    // On load: load session and show login or dashboard
    function init() {
      // If a session exists, go to dashboard
      if (state.session) {
        goTo("dashboard");
        $("#logoutBtn").classList.remove("hide");
      } else {
        goTo("login");
      }
      renderAllUI();
      // Wire up page nav links to buttons inside pages (named data-target)
      $$(".btn[data-target]").forEach(b => b.addEventListener("click", ()=>goTo(b.dataset.target)));
    }
  
    // Save state on unload
    window.addEventListener("beforeunload", saveState);
  
    // finally start
    init();
  
    // Expose a debug helper for console (optional)
    window.__NairaTrust = {
      state,
      performTransaction,
      saveState,
      exportCSV
    };
  
  })();