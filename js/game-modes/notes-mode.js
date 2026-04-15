/* ===================================
   Notes Recognition Game Mode
   =================================== */

const NotesMode = {
    name: 'notes',
    currentChallenge: null,
    stats: {
        streak: 0,
        correct: 0,
        total: 0,
        level: 1
    },
    isActive: false,

    // Start the mode
    start() {
        this.isActive = true;
        this.loadStats();
        this.generateChallenge();
        this.updateTheoryPanel();
        this.setupListeners();
    },

    // Stop the mode
    stop() {
        this.isActive = false;
        this.saveStats();
        UIController.clearHighlights();
        MIDIController.off('noteOn', this.onNotePressed);
    },

    // Generate new challenge
    generateChallenge() {
        // Get random note in range based on level
        const minNote = 48; // C3
        const maxNote = Math.min(72, 48 + this.stats.level * 2); // Expand range with level
        this.currentChallenge = MusicTheory.getRandomNote(minNote, maxNote);

        this.displayChallenge();
    },

    // Display challenge
    displayChallenge() {
        const display = NotationSystem.formatNoteDisplay(this.currentChallenge);

        UIController.updateChallengeDisplay(
            'Toca esta nota:',
            display.main,
            display.alt,
            this.getHint()
        );

        // Highlight the key
        UIController.highlightKeys([this.currentChallenge]);

        // Update stats display
        this.updateStatsDisplay();
    },

    // Get hint for current note
    getHint() {
        const noteInOctave = this.currentChallenge % 12;
        const isWhite = [0, 2, 4, 5, 7, 9, 11].includes(noteInOctave);
        const noteName = MusicTheory.getNoteFromMidi(this.currentChallenge);

        const hints = [
            `💡 Busca la tecla ${isWhite ? 'blanca' : 'negra'} con la etiqueta "${noteName}"`,
            `💡 Esta es una tecla ${isWhite ? 'blanca' : 'negra'}`,
            `💡 La nota ${noteName} está en la octava ${Math.floor(this.currentChallenge / 12) - 1}`
        ];

        return hints[Math.floor(Math.random() * hints.length)];
    },

    // Setup MIDI listeners
    setupListeners() {
        this.onNotePressed = (data) => {
            if (!this.isActive) return;
            this.checkAnswer(data.note);
        };

        MIDIController.on('noteOn', this.onNotePressed);

        // Next button
        const nextBtn = document.getElementById('next-challenge');
        if (nextBtn) {
            nextBtn.onclick = () => this.generateChallenge();
        }

        // Play sound button
        const playSoundBtn = document.getElementById('play-sound');
        if (playSoundBtn) {
            playSoundBtn.onclick = () => this.playCurrentNote();
        }
    },

    // Check if answer is correct
    checkAnswer(pressedNote) {
        this.stats.total++;

        if (pressedNote === this.currentChallenge) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer(pressedNote);
        }
    },

    // Handle correct answer
    handleCorrectAnswer() {
        this.stats.correct++;
        this.stats.streak++;

        // Level up every 10 correct answers
        if (this.stats.correct % 10 === 0) {
            this.stats.level++;
            UIController.showFeedback(`¡Nivel ${this.stats.level}! 🎉`, 'success');
        } else {
            const messages = [
                '¡Correcto! ✓',
                '¡Excelente! 🎵',
                '¡Perfecto! ⭐',
                '¡Muy bien! 👏',
                '¡Sigue así! 🔥'
            ];
            UIController.showFeedback(
                messages[Math.floor(Math.random() * messages.length)],
                'success'
            );
        }

        this.updateStatsDisplay();

        // Auto-advance if enabled
        const settings = UIController.getSettings();
        if (settings.autoAdvance) {
            setTimeout(() => {
                if (this.isActive) this.generateChallenge();
            }, settings.autoAdvanceDelay || 1500);
        }
    },

    // Handle wrong answer
    handleWrongAnswer(pressedNote) {
        this.stats.streak = 0;

        const correctNoteName = NotationSystem.midiToNoteName(this.currentChallenge);
        const pressedNoteName = NotationSystem.midiToNoteName(pressedNote);

        UIController.showFeedback(
            `Incorrecto. Tocaste ${pressedNoteName}, la respuesta era ${correctNoteName} ❌`,
            'error'
        );

        this.updateStatsDisplay();
    },

    // Play current note (visual/audio feedback)
    playCurrentNote() {
        // Flash highlight
        UIController.clearHighlights();
        setTimeout(() => {
            UIController.highlightKeys([this.currentChallenge]);
        }, 100);

        // Play via Audio Engine or MIDI output
        if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
            AudioEngine.playNote(this.currentChallenge, 100, 500);
        } else {
            MIDIController.playNote(this.currentChallenge, 500);
        }
    },

    // Update stats display
    updateStatsDisplay() {
        const accuracy = this.stats.total > 0 ?
            Math.round((this.stats.correct / this.stats.total) * 100) : 0;

        UIController.updateStats({
            streak: this.stats.streak,
            accuracy: accuracy,
            level: this.stats.level
        });
    },

    // Update theory panel
    updateTheoryPanel() {
        const content = `
            <h4>🎵 Reconocimiento de Notas</h4>
            <p>Aprende a identificar y tocar notas individuales en el piano.</p>

            <h5>Las 12 Notas Musicales:</h5>
            <ul>
                <li><strong>Do (C)</strong> - Primera nota de la escala</li>
                <li><strong>Do# (C#)</strong> - Do sostenido (tecla negra)</li>
                <li><strong>Re (D)</strong> - Segunda nota</li>
                <li><strong>Re# (D#)</strong> - Re sostenido</li>
                <li><strong>Mi (E)</strong> - Tercera nota</li>
                <li><strong>Fa (F)</strong> - Cuarta nota</li>
                <li><strong>Fa# (F#)</strong> - Fa sostenido</li>
                <li><strong>Sol (G)</strong> - Quinta nota</li>
                <li><strong>Sol# (G#)</strong> - Sol sostenido</li>
                <li><strong>La (A)</strong> - Sexta nota (440 Hz es el estándar)</li>
                <li><strong>La# (A#)</strong> - La sostenido</li>
                <li><strong>Si (B)</strong> - Séptima nota</li>
            </ul>

            <h5>💡 Consejos:</h5>
            <ul>
                <li>Las teclas blancas son las notas naturales (sin #)</li>
                <li>Las teclas negras son los sostenidos (#) y bemoles (♭)</li>
                <li>Cada octava repite el mismo patrón de 12 notas</li>
                <li>El Do central (C4) está en el medio del piano</li>
            </ul>

            <p><strong>Nivel actual:</strong> ${this.stats.level} |
               <strong>Precisión:</strong> ${Math.round((this.stats.correct / Math.max(this.stats.total, 1)) * 100)}%</p>
        `;

        UIController.updateTheoryPanel(content);
    },

    // Update display (for notation changes)
    updateDisplay() {
        if (this.currentChallenge) {
            this.displayChallenge();
        }
    },

    // Save stats
    saveStats() {
        try {
            localStorage.setItem('pianoMaestro_notesMode_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats:', e);
        }
    },

    // Load stats
    loadStats() {
        try {
            const saved = localStorage.getItem('pianoMaestro_notesMode_stats');
            if (saved) {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load stats:', e);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesMode;
}
