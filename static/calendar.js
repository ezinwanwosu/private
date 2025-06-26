document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('popup-modal');
  const popupDateText = document.getElementById('popup-date-text');
  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const timeInput = document.getElementById('time-input');
  const timeInputWrapper = document.getElementById('time-input-wrapper');

  let selectedDate = null;
  let eventToDelete = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    events: '/api/availability',
    eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: 'short'
  },

    // Click empty date box → ask for time
    dateClick: function(info) {
      selectedDate = info.dateStr;
      eventToDelete = null;

      popupDateText.textContent = `Add availability for ${selectedDate}`;
      timeInput.value = '';
      // In dateClick (adding availability)
      timeInputWrapper.style.display = 'block';

      modal.style.display = 'flex';
    },

    // Click existing availability → ask to remove
    eventClick: function(info) {
      eventToDelete = info.event;
      selectedDate = null;

      popupDateText.textContent = `Remove this availiability?`;
      timeInputWrapper.style.display = 'none';
      modal.style.display = 'flex';
    }
  });

  confirmBtn.addEventListener('click', () => {
    if (selectedDate) {
      // User wants to add availability
      const time = timeInput.value.trim();
      if (!time.match(/^\d{2}:\d{2}$/)) {
        alert('Please enter time in HH:MM format');
        return;
      }

      const datetime = `${selectedDate}T${time}:00`;

      fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: datetime, end: datetime })
      }).then(response => {
        if (!response.ok) throw new Error('Failed to add availability');
        calendar.refetchEvents();
        modal.style.display = 'none';
        selectedDate = null;
      }).catch(() => alert('Error adding availability'));
    } else if (eventToDelete) {
      // User wants to remove availability
      fetch(`/api/availability/${eventToDelete.startStr}`, {
        method: 'DELETE'
      }).then(response => {
        if (!response.ok) throw new Error('Failed to remove availability');
        calendar.refetchEvents();
        modal.style.display = 'none';
        eventToDelete = null;
      }).catch(() => alert('Error removing availability'));
    }
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    selectedDate = null;
    eventToDelete = null;
    timeInputWrapper.style.display = 'block';
  });

  calendar.render();
});
