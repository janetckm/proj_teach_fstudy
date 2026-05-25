document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  const applySelectedBtn = document.getElementById('apply-selected-btn');

  if (!editor) return;

  const toolbarButtons = document.querySelectorAll('.toolbar button[data-command]');

  // Handle toolbar button clicks
  toolbarButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = e.currentTarget.dataset.command;
      
      // Execute formatting command
      document.execCommand(command, false, null);
      
      // Update ARIA pressed state based on current selection state
      const isActive = document.queryCommandState(command);
      e.currentTarget.setAttribute('aria-pressed', isActive);
      
      // Critical HCI: Return focus to editor to preserve caret position for keyboard users
      editor.focus();
    });
  });

  // Sync toolbar state when selection/caret changes inside the editor
  const syncToolbarState = () => {
    toolbarButtons.forEach(btn => {
      const command = btn.dataset.command;
      btn.setAttribute('aria-pressed', document.queryCommandState(command));
    });
  };

  editor.addEventListener('keyup', syncToolbarState);
  editor.addEventListener('mouseup', syncToolbarState);
  editor.addEventListener('click', syncToolbarState);
  editor.addEventListener('input', syncToolbarState);

  // --- Reading & Fullscreen Logic ---
  const submissionText = document.getElementById('submission-text');
  const overlay = document.getElementById('reading-overlay');
  const overlayText = document.getElementById('overlay-text');
  const fullscreenToggle = document.getElementById('fullscreen-toggle');
  const overlayClose = document.getElementById('overlay-close');
  
  // Font size state
  const DEFAULT_FONT_SIZE = 16;
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 32;
  let currentFontSize = DEFAULT_FONT_SIZE;

  // DOM references for controls
  const controls = {
    inline: {
      inc: document.getElementById('font-increase'),
      dec: document.getElementById('font-decrease'),
      reset: document.getElementById('font-reset'),
      display: document.getElementById('font-size-display')
    },
    overlay: {
      inc: document.getElementById('overlay-font-increase'),
      dec: document.getElementById('overlay-font-decrease'),
      reset: document.getElementById('overlay-font-reset'),
      display: document.getElementById('overlay-font-display')
    }
  };

  const updateFontSize = (size) => {
    currentFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
    const formatted = `${currentFontSize}px`;
    
    // Update both inline and overlay displays
    controls.inline.display.textContent = formatted;
    controls.overlay.display.textContent = formatted;
    
    // Apply to both containers
    submissionText.style.fontSize = formatted;
    overlayText.style.fontSize = formatted;
  };

  const bindFontControls = (namespace) => {
    controls[namespace].inc.addEventListener('click', () => updateFontSize(currentFontSize + 2));
    controls[namespace].dec.addEventListener('click', () => updateFontSize(currentFontSize - 2));
    controls[namespace].reset.addEventListener('click', () => updateFontSize(DEFAULT_FONT_SIZE));
  };

  bindFontControls('inline');
  bindFontControls('overlay');

  // Fullscreen toggle
  const openFullscreen = () => {
    overlayText.innerHTML = submissionText.innerHTML; // Sync content
    overlay.hidden = false;
    document.body.classList.add('reading-active');
    fullscreenToggle.setAttribute('aria-pressed', 'true');
    fullscreenToggle.textContent = '⛶ Expanded';
    
    // Focus management
    overlayClose.focus();
  };

  const closeFullscreen = () => {
    overlay.hidden = true;
    document.body.classList.remove('reading-active');
    fullscreenToggle.setAttribute('aria-pressed', 'false');
    fullscreenToggle.textContent = '⛶ Expand';
    
    // Return focus to toggle
    fullscreenToggle.focus();
  };

  fullscreenToggle.addEventListener('click', openFullscreen);
  overlayClose.addEventListener('click', closeFullscreen);

  // ESC key to exit
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) {
      closeFullscreen();
    }
  });

  // Initialize
  updateFontSize(DEFAULT_FONT_SIZE);

  if (applySelectedBtn && editor) {
    applySelectedBtn.addEventListener('click', () => {
      const acceptedCards = document.querySelectorAll('.suggestion-card .btn-icon.accept[aria-pressed="true"]');
      
      if (acceptedCards.length === 0) {
        alert("Please accept at least one suggestion to apply.");
        return;
      }

      let appendText = "<br><strong>--- Applied Refinements ---</strong><br><ul>";
      
      acceptedCards.forEach(btn => {
        const card = btn.closest('.suggestion-card');
        const suggestedText = card.querySelector('.text-block.suggested p').innerText;
        const type = card.dataset.type;
        appendText += `<li><strong>[${type}]</strong> ${suggestedText}</li>`;
      });
      
      appendText += "</ul>";
      
      // Append to editor
      editor.focus();
      document.execCommand('insertHTML', false, appendText);
      
      // Visual feedback
      applySelectedBtn.textContent = "✓ Applied";
      setTimeout(() => {
        applySelectedBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Apply Selected';
      }, 2000);
    });
  }

  // Toggle Accept/Reject State for Buttons
  document.querySelectorAll('.btn-icon').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Toggle aria-pressed for state tracking
      const isPressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', !isPressed);
      
      // Visual toggle logic (optional, CSS handles hover, but active state is good)
      if (btn.classList.contains('accept')) {
         btn.style.background = !isPressed ? 'var(--color-primary)' : '';
         btn.style.color = !isPressed ? 'white' : '';
      }
    });
  });
  
});

