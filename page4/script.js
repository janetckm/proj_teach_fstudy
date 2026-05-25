document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
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

  const generateBtn = document.getElementById('generate-btn');
  
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const sliders = document.querySelectorAll('.tri-slider');
      const settings = {};
      
      // Map values: 0=Left, 1=Center, 2=Right
      const mapValue = (val) => {
        if(val == 0) return 'Left';
        if(val == 2) return 'Right';
        return 'Blended';
      };

      sliders.forEach(slider => {
        const param = slider.dataset.param;
        settings[param] = mapValue(slider.value);
      });

      console.log("Generating feedback with settings:", settings);
      
      // Visual feedback on button
      const originalText = generateBtn.innerHTML;
      generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
      
      setTimeout(() => {
        generateBtn.innerHTML = originalText;
        alert(`Feedback generated with:\nFocus: ${settings.focus}\nScope: ${settings.scope}\nStrategy: ${settings.strategy}\nOrientation: ${settings.orientation}`);
      }, 800);
    });
  }

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
  
});

