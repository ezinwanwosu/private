document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('popup-modal');
  const popupDateText = document.getElementById('popup-date-text');
  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const timeInput = document.getElementById('time-input');
  const removeWholeDayCheckbox = document.getElementById('remove-whole-day');

  let selectedDateForAvailability = null;
  let availabilityExists = false;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    events: '/api/availability',

    select: function (info) {
      selectedDateForAvailability = info.startStr;

      const events = calendar.getEvents();
      availabilityExists = events.some(event =>
        event.startStr.startsWith(selectedDateForAvailability)
      );

      popupDateText.textContent = `Manage availability for ${selectedDateForAvailability}?`;
      confirmBtn.textContent = '✔';

      timeInput.value = '';
      removeWholeDayCheckbox.checked = false;

      modal.style.display = 'flex';
    }
  });

  confirmBtn.addEventListener('click', () => {
    if (!selectedDateForAvailability) return;

    const enteredTime = timeInput.value;
    const removeWholeDay = removeWholeDayCheckbox.checked;

    if (!enteredTime && !removeWholeDay) {
      alert('Please enter a time or select "Remove whole day".');
      return;
    }

    if (removeWholeDay) {
      // Remove all availability for the selected date
      fetch('/api/availability', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDateForAvailability })  // indicate whole day removal
      }).then(() => {
        calendar.refetchEvents();
        modal.style.display = 'none';
        selectedDateForAvailability = null;
      }).catch(() => {
        alert('Failed to remove whole day availability.');
      });
    } else {
      // Remove or add single time slot (toggle behavior)

      // Compose datetime string
      const datetime = `${selectedDateForAvailability}T${enteredTime}:00`;

      // Check if this exact datetime already exists
      const existingEvent = calendar.getEvents().find(event => event.startStr === datetime);

      if (existingEvent) {
        // Remove this specific time slot
        fetch('/api/availability', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datetime })
        }).then(() => {
          calendar.refetchEvents();
          modal.style.display = 'none';
          selectedDateForAvailability = null;
        }).catch(() => {
          alert('Failed to remove availability.');
        });
      } else {
        // Add new availability slot
        fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start: datetime, end: datetime })
        }).then(() => {
          calendar.refetchEvents();
          modal.style.display = 'none';
          selectedDateForAvailability = null;
        }).catch(() => {
          alert('Failed to add availability.');
        });
      }
    }
  });

  cancelBtn.addEventListener('click', () => {
    selectedDateForAvailability = null;
    modal.style.display = 'none';
  });

  calendar.render();
});
