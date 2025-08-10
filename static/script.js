const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17,18]; // 1hr increments

const daysContainer = document.getElementById("days-container");
const statusEl = document.getElementById("status");

// Map day name to number (Sunday=0)
const dayNameToNumber = {
  "Sunday": 0, "Monday": 1, "Tuesday": 2,
  "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6
};

function getDatesForWeekdayInMonth(weekdayNum) {
  const dates = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  let date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === weekdayNum) {
      dates.push(new Date(date)); // clone
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function createDayBox(day) {
  const box = document.createElement("div");
  box.classList.add("day-box");

  const title = document.createElement("h3");
  title.textContent = day;
  box.appendChild(title);

  // Dates list - now clickable/selectable
  const datesList = document.createElement("ul");
  datesList.classList.add("dates-list");

  const weekdayNum = dayNameToNumber[day];
  const dates = getDatesForWeekdayInMonth(weekdayNum);

  dates.forEach(d => {
    const li = document.createElement("li");
    li.textContent = formatDate(d);
    li.classList.add("date-item");
    li.style.cursor = "pointer";

    // Toggle selected class on click
    li.addEventListener("click", () => {
      li.classList.toggle("selected-date");
      if (li.classList.contains("selected-date")) {
        li.style.backgroundColor = "pink";
      } else {
        li.style.backgroundColor = "";  // reset to default when unselected
      }
      
    });
    datesList.appendChild(li);
  });

  box.appendChild(datesList);

  // Times buttons
  const timeSlotDiv = document.createElement("div");
  timeSlotDiv.classList.add("time-slot");

  hours.forEach(hour => {
    const btn = document.createElement("button");
    btn.classList.add("time-btn");
    btn.textContent = `${hour}:00`;
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
    });
    timeSlotDiv.appendChild(btn);
  });

  // Apply to all days times button
  const applyBtn = document.createElement("button");
  applyBtn.textContent = "Apply to All Days";
  applyBtn.addEventListener("click", () => {
    const selectedTimes = Array.from(timeSlotDiv.querySelectorAll(".time-btn.selected")).map(b => b.textContent);
    document.querySelectorAll(".day-box").forEach(box => {
      const btns = box.querySelectorAll(".time-btn");
      btns.forEach(btn => {
        if (selectedTimes.includes(btn.textContent)) {
          btn.classList.add("selected");
        }
      });
    });
  });

  box.appendChild(timeSlotDiv);
  box.appendChild(applyBtn);
  return box;
}

daysOfWeek.forEach(day => {
  daysContainer.appendChild(createDayBox(day));
});

document.getElementById("save-btn").addEventListener("click", async () => {
  const slots = [];

  document.querySelectorAll(".day-box").forEach(box => {
    const day = box.querySelector("h3").textContent;
    const datesListItems = box.querySelectorAll(".dates-list li.selected-date");

    const selectedTimes = Array.from(box.querySelectorAll(".time-btn.selected")).map(b => b.textContent);

    // Only use dates that are selected!
    datesListItems.forEach(li => {
      const dateObj = new Date(li.textContent);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");

      selectedTimes.forEach(timeStr => {
        const [hour, minute] = timeStr.split(":").map(Number);
        const hh = String(hour).padStart(2, "0");
        const mmPart = String(minute).padStart(2, "0");
        slots.push({ start: `${yyyy}-${mm}-${dd}T${hh}:${mmPart}:00` });
      });
    });
  });

  try {
    const res = await fetch("/save-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slots),
    });
    console.log(slots);
    if (res.ok) {
      statusEl.textContent = "Availability saved successfully!";
      statusEl.style.color = "green";
    } else {
      statusEl.textContent = "Error saving availability.";
      statusEl.style.color = "red";
    }
  } catch (error) {
    statusEl.textContent = "Network error.";
    statusEl.style.color = "red";
  }
});
