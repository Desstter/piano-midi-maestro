/* ===================================
   UI Controller Module
   Handles all UI interactions and piano rendering
   =================================== */

const UIController = {
    canvas: null,
    ctx: null,
    pianoSettings: {
        whiteKeyWidth: 40,
        whiteKeyHeight: 150,
        blackKeyWidth: 24,
        blackKeyHeight: 95,
        startNote: 48, // C3
        endNote: 72,   // C5 (2 octaves for 32-key MIDI)
        highlightedKeys: new Set(),
        pressedKeys: new Set()
    },
    settings: {
        showHints: true,
        showStaff: true,
        autoAdvance: true,  // Auto-advance to next challenge after correct answer
        autoAdvanceDelay: 1500,  // Delay in milliseconds before auto-advance
        timedMode: false
    },

    // Initialize
    init() {
        this.canvas = document.getElementById('piano-canvas');
        if (!this.canvas) {
            console.error('Piano canvas not found');
            return false;
        }

        this.ctx = this.canvas.getContext('2d');
        this.loadSettings();
        this.setupEventListeners();
        this.drawPiano();
        this.setupMIDIListeners();
        return true;
    },

    // Setup event listeners
    setupEventListeners() {
        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        const closeSettings = document.getElementById('close-settings');
        const settingsModal = document.getElementById('settings-modal');

        settingsBtn?.addEventListener('click', () => {
            settingsModal?.classList.add('active');
        });

        closeSettings?.addEventListener('click', () => {
            settingsModal?.classList.remove('active');
        });

        settingsModal?.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });

        // Settings options
        const showHintsBtn = document.getElementById('show-hints');
        const timedModeCheckbox = document.getElementById('timed-mode');
        const showStaffCheckbox = document.getElementById('show-staff');
        const autoAdvanceCheckbox = document.getElementById('auto-advance');

        showHintsBtn?.addEventListener('click', () => {
            this.settings.showHints = !this.settings.showHints;
            showHintsBtn.classList.toggle('active', this.settings.showHints);
            this.updateHintVisibility();
            this.saveSettings();
        });

        timedModeCheckbox?.addEventListener('change', (e) => {
            this.settings.timedMode = e.target.checked;
            this.saveSettings();
        });

        showStaffCheckbox?.addEventListener('change', (e) => {
            this.settings.showStaff = e.target.checked;
            this.saveSettings();
        });

        autoAdvanceCheckbox?.addEventListener('change', (e) => {
            this.settings.autoAdvance = e.target.checked;
            this.saveSettings();
        });

        // Notation radio buttons
        const notationRadios = document.querySelectorAll('input[name="notation"]');
        notationRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                NotationSystem.setNotation(e.target.value);
                // Trigger re-render of current challenge if any
                if (window.currentGameMode) {
                    window.currentGameMode.updateDisplay();
                }
            });
        });

        // Set initial notation radio state
        const currentNotation = NotationSystem.getNotation();
        const notationRadio = document.querySelector(`input[name="notation"][value="${currentNotation}"]`);
        if (notationRadio) {
            notationRadio.checked = true;
        }

        // Canvas resize
        window.addEventListener('resize', () => this.drawPiano());

        // Canvas click/touch for playing notes
        this.canvas?.addEventListener('mousedown', (e) => this.handleCanvasClick(e));
        this.canvas?.addEventListener('touchstart', (e) => this.handleCanvasClick(e));
    },

    // Setup MIDI listeners
    setupMIDIListeners() {
        MIDIController.on('noteOn', (data) => {
            this.pianoSettings.pressedKeys.add(data.note);
            this.drawPiano();
        });

        MIDIController.on('noteOff', (data) => {
            this.pianoSettings.pressedKeys.delete(data.note);
            this.drawPiano();
        });
    },

    // Draw piano
    drawPiano() {
        if (!this.ctx || !this.canvas) return;

        const { whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight, startNote, endNote } = this.pianoSettings;

        // Calculate canvas size
        const whiteKeys = this.getWhiteKeyCount(startNote, endNote);
        this.canvas.width = whiteKeys * whiteKeyWidth;
        this.canvas.height = whiteKeyHeight;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw white keys first
        let whiteKeyIndex = 0;
        for (let note = startNote; note <= endNote; note++) {
            if (this.isWhiteKey(note)) {
                this.drawKey(note, whiteKeyIndex * whiteKeyWidth, 0, whiteKeyWidth, whiteKeyHeight, true);
                whiteKeyIndex++;
            }
        }

        // Draw black keys on top
        whiteKeyIndex = 0;
        for (let note = startNote; note <= endNote; note++) {
            if (this.isWhiteKey(note)) {
                // Check if next note is black
                if (note < endNote && !this.isWhiteKey(note + 1)) {
                    const x = (whiteKeyIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;
                    this.drawKey(note + 1, x, 0, blackKeyWidth, blackKeyHeight, false);
                }
                whiteKeyIndex++;
            }
        }
    },

    // Draw individual key
    drawKey(note, x, y, width, height, isWhite) {
        const isPressed = this.pianoSettings.pressedKeys.has(note);
        const isHighlighted = this.pianoSettings.highlightedKeys.has(note);

        // Get colors from CSS variables
        const style = getComputedStyle(document.documentElement);
        const whiteKeyColor = isPressed ?
            style.getPropertyValue('--white-key-pressed').trim() :
            style.getPropertyValue('--white-key').trim();
        const blackKeyColor = isPressed ?
            style.getPropertyValue('--black-key-pressed').trim() :
            style.getPropertyValue('--black-key').trim();
        const borderColor = style.getPropertyValue('--key-border').trim();
        const highlightColor = style.getPropertyValue('--key-highlight').trim();

        // Draw key body
        this.ctx.fillStyle = isWhite ? whiteKeyColor : blackKeyColor;
        this.ctx.fillRect(x, y, width, height);

        // Draw border
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);

        // Draw highlight if active
        if (isHighlighted && this.settings.showHints) {
            this.ctx.fillStyle = highlightColor;
            this.ctx.fillRect(x, y, width, height);
        }

        // Draw note label at bottom
        if (isWhite) {
            const noteName = NotationSystem.midiToNoteName(note, false);
            this.ctx.fillStyle = '#666';
            this.ctx.font = '10px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(noteName, x + width / 2, y + height - 5);
        }

        // Draw pressed indicator
        if (isPressed) {
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.6)';
            const indicatorHeight = 8;
            this.ctx.fillRect(x + 2, y + height - indicatorHeight - 2, width - 4, indicatorHeight);
        }
    },

    // Check if note is white key
    isWhiteKey(midiNote) {
        const noteInOctave = midiNote % 12;
        // C=0, D=2, E=4, F=5, G=7, A=9, B=11 are white keys
        return [0, 2, 4, 5, 7, 9, 11].includes(noteInOctave);
    },

    // Count white keys in range
    getWhiteKeyCount(startNote, endNote) {
        let count = 0;
        for (let note = startNote; note <= endNote; note++) {
            if (this.isWhiteKey(note)) count++;
        }
        return count;
    },

    // Highlight keys
    highlightKeys(notes) {
        this.pianoSettings.highlightedKeys.clear();
        notes.forEach(note => this.pianoSettings.highlightedKeys.add(note));
        this.drawPiano();
    },

    // Clear highlights
    clearHighlights() {
        this.pianoSettings.highlightedKeys.clear();
        this.drawPiano();
    },

    // Handle canvas click to play notes
    handleCanvasClick(event) {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const { whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight, startNote, endNote } = this.pianoSettings;

        // Check black keys first (they're on top)
        let whiteKeyIndex = 0;
        for (let note = startNote; note <= endNote; note++) {
            if (this.isWhiteKey(note)) {
                // Check if next note is black
                if (note < endNote && !this.isWhiteKey(note + 1)) {
                    const blackX = (whiteKeyIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;
                    if (x >= blackX && x <= blackX + blackKeyWidth && y <= blackKeyHeight) {
                        this.playCanvasNote(note + 1);
                        return;
                    }
                }
                whiteKeyIndex++;
            }
        }

        // Check white keys
        whiteKeyIndex = 0;
        for (let note = startNote; note <= endNote; note++) {
            if (this.isWhiteKey(note)) {
                const whiteX = whiteKeyIndex * whiteKeyWidth;
                if (x >= whiteX && x <= whiteX + whiteKeyWidth && y <= whiteKeyHeight) {
                    this.playCanvasNote(note);
                    return;
                }
                whiteKeyIndex++;
            }
        }
    },

    // Play note from canvas click
    playCanvasNote(note) {
        // Play sound
        if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
            AudioEngine.playNote(note, 100, 300); // Medium velocity, 300ms duration
        }

        // Visual feedback
        this.pianoSettings.pressedKeys.add(note);
        this.drawPiano();

        setTimeout(() => {
            this.pianoSettings.pressedKeys.delete(note);
            this.drawPiano();
        }, 300);
    },

    // Show feedback
    showFeedback(message, type = 'success') {
        const feedbackEl = document.getElementById('feedback');
        if (!feedbackEl) return;

        feedbackEl.innerHTML = '';

        const msgEl = document.createElement('div');
        msgEl.className = `feedback-message ${type}`;
        msgEl.textContent = message;
        feedbackEl.appendChild(msgEl);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => msgEl.remove(), 300);
        }, 3000);
    },

    // Update hint visibility
    updateHintVisibility() {
        const hintArea = document.getElementById('hint-area');
        if (hintArea) {
            hintArea.style.display = this.settings.showHints ? 'block' : 'none';
        }
        this.drawPiano(); // Redraw to update key highlights
    },

    // Update challenge display
    updateChallengeDisplay(title, mainText, altText = '', hint = '') {
        const titleEl = document.getElementById('challenge-title');
        const mainEl = document.getElementById('note-main');
        const altEl = document.getElementById('note-alt');
        const hintEl = document.getElementById('hint-area');

        if (titleEl) titleEl.textContent = title;
        if (mainEl) mainEl.textContent = mainText;
        if (altEl) {
            altEl.textContent = altText;
            altEl.style.display = altText ? 'block' : 'none';
        }

        if (hintEl) {
            const hintText = hintEl.querySelector('.hint-text');
            if (hintText) hintText.textContent = hint;
            hintEl.style.display = this.settings.showHints && hint ? 'block' : 'none';
        }
    },

    // Update progress stats
    updateStats(stats) {
        const streakEl = document.getElementById('streak');
        const accuracyEl = document.getElementById('accuracy');
        const levelEl = document.getElementById('level');

        if (streakEl) streakEl.textContent = stats.streak || 0;
        if (accuracyEl) accuracyEl.textContent = `${stats.accuracy || 0}%`;
        if (levelEl) levelEl.textContent = stats.level || 1;
    },

    // Update theory panel
    updateTheoryPanel(content) {
        const theoryContent = document.getElementById('theory-content');
        if (theoryContent) {
            theoryContent.innerHTML = content;
        }
    },

    // Timer management
    startTimer(duration, onTick, onComplete) {
        const timerEl = document.getElementById('timer');
        if (!timerEl || !this.settings.timedMode) return null;

        let remaining = duration;
        timerEl.textContent = remaining + 's';

        const interval = setInterval(() => {
            remaining--;
            timerEl.textContent = remaining + 's';

            if (onTick) onTick(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 1000);

        return interval;
    },

    stopTimer(timerId) {
        if (timerId) clearInterval(timerId);
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = '';
    },

    // Settings persistence
    saveSettings() {
        try {
            localStorage.setItem('pianoMaestro_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem('pianoMaestro_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };

                // Apply loaded settings to UI
                const showHintsBtn = document.getElementById('show-hints');
                if (showHintsBtn) {
                    showHintsBtn.classList.toggle('active', this.settings.showHints);
                }

                const timedModeCheckbox = document.getElementById('timed-mode');
                if (timedModeCheckbox) {
                    timedModeCheckbox.checked = this.settings.timedMode;
                }

                const showStaffCheckbox = document.getElementById('show-staff');
                if (showStaffCheckbox) {
                    showStaffCheckbox.checked = this.settings.showStaff;
                }

                const autoAdvanceCheckbox = document.getElementById('auto-advance');
                if (autoAdvanceCheckbox) {
                    autoAdvanceCheckbox.checked = this.settings.autoAdvance;
                }
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    },

    // Get settings
    getSettings() {
        return { ...this.settings };
    }
};

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        UIController.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
