document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("goal-form");
    const goalList = document.getElementById("goal-list");
  
    function loadGoals() {
      const goals = JSON.parse(localStorage.getItem("savingsGoals")) || [];
      return goals;
    }
  
    function saveGoals(goals) {
      localStorage.setItem("savingsGoals", JSON.stringify(goals));
    }
  
    function renderGoals() {
      const goals = loadGoals();
      goalList.innerHTML = "";
      if (goals.length === 0) {
        goalList.innerHTML = `<p class="no-goals">No savings goals yet. Add one above!</p>`;
        return;
      }
  
      goals.forEach((goal, idx) => {
        const progressPercent = Math.min(100, (goal.saved / goal.target) * 100).toFixed(1);
        const goalDiv = document.createElement("div");
        goalDiv.classList.add("goal-item");
        goalDiv.innerHTML = `
          <div class="goal-header">
            <span>${goal.name}</span>
            <span>₦${goal.saved.toLocaleString()} / ₦${goal.target.toLocaleString()}</span>
          </div>
          <div class="progress-bar-bg" aria-label="Progress bar for ${goal.name}">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="deposit-section">
            <input type="number" min="1" placeholder="Add amount" aria-label="Add money to ${goal.name}" />
            <button aria-label="Deposit to ${goal.name}">Deposit</button>
          </div>
        `;
  
        // Deposit logic
        const input = goalDiv.querySelector("input");
        const btn = goalDiv.querySelector("button");
        btn.addEventListener("click", () => {
          const val = Number(input.value);
          if (!val || val < 1) {
            alert("Please enter a valid deposit amount (at least 1 ₦).");
            return;
          }
          if (goal.saved + val > goal.target) {
            alert("Deposit exceeds target amount!");
            return;
          }
          goal.saved += val;
          saveGoals(goals);
          renderGoals();
        });
  
        goalList.appendChild(goalDiv);
      });
    }
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("goal-name").value.trim();
      const target = Number(document.getElementById("goal-target").value);
  
      if (!name) {
        alert("Please enter a goal name.");
        return;
      }
      if (!target || target < 1000) {
        alert("Target amount must be at least ₦1000.");
        return;
      }
  
      const goals = loadGoals();
      goals.push({ name, target, saved: 0 });
      saveGoals(goals);
  
      form.reset();
      renderGoals();
    });
  
    renderGoals();
  });
  