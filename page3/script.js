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

  // Feedback Bank Logic
  const toggles = document.querySelectorAll('.snippet-item input[type="checkbox"]');
  const searchInput = document.getElementById('snippet-search');

  // Define the text mapping (Simulating the logic from the image)
  // In a real app, this might come from a database.
  // Note: The image shows a complex paragraph. Here we concatenate active snippets.
  const snippetMap = {
    'some-understanding': 'You shows <strong>some understanding</strong> of ideas, themes, events and characters in the texts studied.',
    'too-general': 'The response is <strong>too general</strong>.',
    'explains-clearly': 'In some instances, you did well in explaining <strong>clearly</strong> the effects of certain words and sentences on the intended reader.',
    'simple-inferences': 'However, you make <strong>simple, limited</strong> inferences and deductions.',
    'points-general': 'More specifically, some points remain a little general; aim for more precise explanation of <em>how</em> the language has an impact.',
    'link-impact-2': 'Stronger moments of analysis appear when you link word choice to reader impact.',
    'elaborate-quotes': 'Elaborate on the quotes you choose to explore.',
    'effective-evidence': 'Effective selection of evidence.',
    'writer-choice': 'Makes <strong>some attempt</strong> to describe why a writer might have chosen particular words.',
    'link-impact-1': 'Stronger moments of analysis appear when you link word choice to reader impact.',
    'link-impact-3': 'Stronger moments of analysis appear when you link word choice to reader impact.',
    'avoid-repetition': 'Avoid repetition, make sure to diversify in the language you use.'
  };

  const updateEditor = () => {
    let activeSnippets = [];
    
    // Collect text from checked boxes
    toggles.forEach(toggle => {
      if (toggle.checked) {
        const key = toggle.dataset.snippet;
        if (snippetMap[key]) {
          activeSnippets.push(snippetMap[key]);
        }
      }
    });

    // Join with spaces (or newlines if preferred)
    // The image shows a flowing paragraph, so we join with spaces.
    const feedbackHTML = activeSnippets.join(' ');
    
    if (editor) {
      editor.innerHTML = feedbackHTML || '<p>Toggle snippets to generate feedback...</p>';
    }
  };

  // Event Listeners for Toggles
  toggles.forEach(toggle => {
    toggle.addEventListener('change', updateEditor);
  });

  // Search Filter Logic
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.snippet-item').forEach(item => {
        const text = item.querySelector('.snippet-text').textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
      });
    });

     updateEditor();
  }

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
  
  
});

