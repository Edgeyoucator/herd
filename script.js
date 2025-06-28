// STEP 1: Generate drop zones with built-in labels
const circleRow = document.getElementById("circleRow");
for (let i = 0; i < 8; i++) {
  const dropZoneWrapper = document.createElement("div");
  dropZoneWrapper.classList.add("drop-zone-wrapper");

  const dropZone = document.createElement("div");
  dropZone.classList.add("drop-zone");
  dropZone.dataset.position = i;

  const label = document.createElement("span");
  label.classList.add("external-label");
  label.textContent = ""; // start empty

  dropZoneWrapper.appendChild(dropZone);
  dropZoneWrapper.appendChild(label);
  circleRow.appendChild(dropZoneWrapper);
}

// Track dragged element and its last drop zone
let draggedItem = null;
let originZoneWrapper = null;

// Setup drag-and-drop
function setupDraggables() {
  document.querySelectorAll('.draggable-wrapper').forEach(item => {
    item.addEventListener('dragstart', () => {
      draggedItem = item;

      // Store the original drop zone wrapper (if any)
      originZoneWrapper = [...document.querySelectorAll('.drop-zone-wrapper')].find(wrapper =>
        wrapper.querySelector('.drop-zone').contains(draggedItem)
      );

      setTimeout(() => {
        item.style.display = 'none';
      }, 0);
    });

    item.addEventListener('dragend', () => {
      item.style.display = 'flex';
      draggedItem = null;
      originZoneWrapper = null;
    });

    // Touch support using pointer events
    item.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') return;
      e.preventDefault();
      draggedItem = item;
      originZoneWrapper = [...document.querySelectorAll('.drop-zone-wrapper')].find(wrapper =>
        wrapper.querySelector('.drop-zone').contains(draggedItem)
      );

      const rect = item.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      item.classList.add('dragging');
      item.style.left = rect.left + 'px';
      item.style.top = rect.top + 'px';

      const moveHandler = ev => {
        item.style.left = (ev.clientX - offsetX) + 'px';
        item.style.top = (ev.clientY - offsetY) + 'px';
      };

      const upHandler = ev => {
        document.removeEventListener('pointermove', moveHandler);
        document.removeEventListener('pointerup', upHandler);

        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const zone = target && target.closest('.drop-zone');
        const bank = document.getElementById('dragBank');

        if (zone) {
          const existing = zone.querySelector('.draggable-wrapper');
          if (existing) {
            bank.appendChild(existing);
            restoreDraggable(existing);
          }
          zone.appendChild(draggedItem);
          resizeDraggable(draggedItem, "100%");
          const internal = draggedItem.querySelector('.label');
          if (internal) internal.remove();
          if (originZoneWrapper) {
            const oldLabel = originZoneWrapper.querySelector('.external-label');
            if (oldLabel) oldLabel.textContent = "";
          }
          const labelSpan = zone.parentElement.querySelector('.external-label');
          labelSpan.textContent = draggedItem.dataset.label;
        } else if (bank.contains(target)) {
          bank.appendChild(draggedItem);
          restoreDraggable(draggedItem);
          if (originZoneWrapper) {
            const label = originZoneWrapper.querySelector('.external-label');
            if (label) label.textContent = "";
          }
          if (!draggedItem.querySelector('.label')) {
            const label = document.createElement('span');
            label.classList.add('label');
            label.textContent = draggedItem.dataset.label;
            draggedItem.appendChild(label);
          }
        }

        item.classList.remove('dragging');
        item.style.left = '';
        item.style.top = '';
        draggedItem = null;
        originZoneWrapper = null;
      };

      document.addEventListener('pointermove', moveHandler);
      document.addEventListener('pointerup', upHandler);
    });
  });

  // Drop zones
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => e.preventDefault());

    zone.addEventListener('drop', () => {
      if (draggedItem) {
        // If replacing, restore the previous item
        const existing = zone.querySelector('.draggable-wrapper');
        if (existing) {
          document.getElementById('dragBank').appendChild(existing);
          restoreDraggable(existing);
        }

        // Drop the dragged item
        zone.appendChild(draggedItem);
        resizeDraggable(draggedItem, "100%");

        // Remove internal label
        const internal = draggedItem.querySelector('.label');
        if (internal) internal.remove();

        // Clear old label from original zone if it existed
        if (originZoneWrapper) {
          const oldLabel = originZoneWrapper.querySelector('.external-label');
          if (oldLabel) oldLabel.textContent = "";
        }

        // Update current label
        const labelSpan = zone.parentElement.querySelector('.external-label');
        labelSpan.textContent = draggedItem.dataset.label;
      }
    });
  });

  // Dragging back into bank
  const bank = document.getElementById('dragBank');
  bank.addEventListener('dragover', e => e.preventDefault());

  bank.addEventListener('drop', () => {
    if (draggedItem) {
      bank.appendChild(draggedItem);
      restoreDraggable(draggedItem);

      // Clear external label from original drop zone if applicable
      if (originZoneWrapper) {
        const label = originZoneWrapper.querySelector('.external-label');
        if (label) label.textContent = "";
      }

      // Restore internal label
      if (!draggedItem.querySelector('.label')) {
        const label = document.createElement('span');
        label.classList.add('label');
        label.textContent = draggedItem.dataset.label;
        draggedItem.appendChild(label);
      }
    }
  });
}

function resizeDraggable(el, size) {
  el.style.width = size;
  el.style.height = size;
  const img = el.querySelector('img');
  img.style.width = size;
  img.style.height = size;
}

function restoreDraggable(el) {
  resizeDraggable(el, "80px");
}

// Answer check
const correctOrder = [
  "quarks",
  "protons",
  "atoms",
  "molecules",
  "cells",
  "organs",
  "individual",
  "herd"
];

document.getElementById("checkBtn").addEventListener("click", () => {
  const zones = document.querySelectorAll('.drop-zone');
  const isCorrect = [...zones].every((zone, index) => {
    const child = zone.querySelector('.draggable-wrapper');
    return child && child.dataset.id === correctOrder[index];
  });

  showSplashScreen(isCorrect);
});

// Splash screen
function showSplashScreen(success) {
  const splash = document.createElement("div");
  splash.id = "splash-screen";
  splash.innerHTML = success
    ? `
      <div class="splash-content">
        <h2>🎉 Correct!</h2>
        <p>Your password is: <strong>order</strong></p>
        <p><em>Click anywhere to continue.</em></p>
      </div>`
    : `
      <div class="splash-content">
        <h2>❌ Try Again</h2>
        <p>Check your order and adjust as needed.</p>
      </div>`;

  splash.addEventListener("click", () => splash.remove());
  document.body.appendChild(splash);

  if (!success) {
    setTimeout(() => splash.remove(), 2000);
  }
}

setupDraggables();
