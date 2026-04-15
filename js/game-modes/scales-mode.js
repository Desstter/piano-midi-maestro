/* ===================================
   Scales Practice Game Mode
   =================================== */

const ScalesMode = {
    name: 'scales',
    currentChallenge: null,
    stats: {
        streak: 0,
        correct: 0,
        total: 0,
        level: 1
    },
    isActive: false,
    playedNotes: [],
    expectedIndex: 0,

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
        this.playedNotes = [];
    },

    // Generate new challenge
    generateChallenge() {
        const scaleTypes = this.getAvailableScaleTypes();
        const randomScale = scaleTypes[Math.floor(Math.random() * scaleTypes.length)];
        const rootNote = MusicTheory.getRandomNote(48, 60); // C3 to C4

        this.currentChallenge = {
            root: rootNote,
            type: randomScale,
            notes: MusicTheory.getScaleNotes(rootNote, randomScale)
        };

        this.playedNotes = [];
        this.expectedIndex = 0;
        this.displayChallenge();
    },

    // Get available scale types based on level
    getAvailableScaleTypes() {
        const allScales = [
            'Mayor',
            'Menor Natural',
            'Menor Armónica',
            'Menor Melódica',
            'Pentatónica Mayor',
            'Pentatónica Menor',
            'Blues',
            'Cromática'
        ];

        // Gradually introduce more scales
        const level = this.stats.level;
        if (level <= 2) return ['Mayor', 'Menor Natural'];
        if (level <= 4) return ['Mayor', 'Menor Natural', 'Pentatónica Mayor', 'Pentatónica Menor'];
        if (level <= 6) return ['Mayor', 'Menor Natural', 'Menor Armónica', 'Pentatónica Mayor', 'Pentatónica Menor'];
        return allScales;
    },

    // Display challenge
    displayChallenge() {
        const display = NotationSystem.formatScaleName(
            this.currentChallenge.root,
            this.currentChallenge.type
        );

        const scaleInfo = MusicTheory.scales[this.currentChallenge.type];
        const noteNames = this.currentChallenge.notes.map(note =>
            NotationSystem.midiToNoteName(note, false)
        ).join(' - ');

        const progress = `${this.playedNotes.length}/${this.currentChallenge.notes.length}`;

        UIController.updateChallengeDisplay(
            'Toca esta escala (en orden):',
            display.main,
            display.alt || scaleInfo?.description || '',
            `💡 ${noteNames} | Progreso: ${progress}`
        );

        // Highlight next note to play
        if (this.expectedIndex < this.currentChallenge.notes.length) {
            UIController.highlightKeys([this.currentChallenge.notes[this.expectedIndex]]);
        }

        // Update stats display
        this.updateStatsDisplay();
    },

    // Setup MIDI listeners
    setupListeners() {
        this.onNotePressed = (data) => {
            if (!this.isActive) return;
            this.checkNote(data.note);
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
            playSoundBtn.onclick = () => this.playCurrentScale();
        }
    },

    // Check if note is correct
    checkNote(pressedNote) {
        const expectedNote = this.currentChallenge.notes[this.expectedIndex];

        // Check if correct note (allow any octave)
        const pressedNormalized = pressedNote % 12;
        const expectedNormalized = expectedNote % 12;

        if (pressedNormalized === expectedNormalized) {
            // Correct note!
            this.playedNotes.push(pressedNote);
            this.expectedIndex++;

            // Check if scale is complete
            if (this.expectedIndex >= this.currentChallenge.notes.length) {
                this.handleCorrectAnswer();
            } else {
                // Move to next note
                this.displayChallenge();
                UIController.showFeedback(`✓ Nota ${this.expectedIndex}/${this.currentChallenge.notes.length}`, 'success');
            }
        } else {
            // Wrong note
            this.handleWrongAnswer(pressedNote);
        }
    },

    // Handle correct answer (completed scale)
    handleCorrectAnswer() {
        this.stats.correct++;
        this.stats.total++;
        this.stats.streak++;

        // Level up every 6 correct scales
        if (this.stats.correct % 6 === 0) {
            this.stats.level++;
            UIController.showFeedback(`¡Nivel ${this.stats.level}! Escalas más complejas 🎉`, 'success');
        } else {
            const messages = [
                '¡Escala perfecta! ✓',
                '¡Excelente digitación! 🎵',
                '¡Fluidez impecable! ⭐',
                '¡Muy bien! 👏',
                '¡Maestro de escalas! 🔥'
            ];
            UIController.showFeedback(
                messages[Math.floor(Math.random() * messages.length)],
                'success'
            );
        }

        UIController.clearHighlights();
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
        this.stats.total++;
        this.stats.streak = 0;

        const expectedNote = this.currentChallenge.notes[this.expectedIndex];
        const pressedName = NotationSystem.midiToNoteName(pressedNote, false);
        const expectedName = NotationSystem.midiToNoteName(expectedNote, false);

        UIController.showFeedback(
            `Incorrecto. Tocaste ${pressedName}, esperaba ${expectedName}. ¡Intenta de nuevo! ❌`,
            'error'
        );

        // Reset progress
        this.playedNotes = [];
        this.expectedIndex = 0;
        this.displayChallenge();
        this.updateStatsDisplay();
    },

    // Play current scale
    playCurrentScale() {
        // Play scale notes in sequence
        this.currentChallenge.notes.forEach((note, index) => {
            setTimeout(() => {
                // Play via Audio Engine or MIDI
                if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
                    AudioEngine.playNote(note, 100, 400);
                } else {
                    MIDIController.playNote(note, 400);
                }

                // Highlight the note being played
                UIController.highlightKeys([note]);
            }, index * 450);
        });

        // Clear highlight after done
        setTimeout(() => {
            if (this.expectedIndex < this.currentChallenge.notes.length) {
                UIController.highlightKeys([this.currentChallenge.notes[this.expectedIndex]]);
            }
        }, this.currentChallenge.notes.length * 450);
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
            <h4>🎹 Escalas Musicales</h4>
            <p>Una escala es una secuencia ordenada de notas. Son fundamentales para la improvisación y composición.</p>

            <h5>Tipos de Escalas:</h5>
            <ul>
                <li><strong>Mayor</strong> - Sonido alegre (T-T-S-T-T-T-S)</li>
                <li><strong>Menor Natural</strong> - Sonido triste (T-S-T-T-S-T-T)</li>
                <li><strong>Menor Armónica</strong> - Sonido exótico con 7ª mayor</li>
                <li><strong>Menor Melódica</strong> - Diferente subiendo y bajando</li>
                <li><strong>Pentatónica Mayor</strong> - 5 notas, usada en blues/rock</li>
                <li><strong>Pentatónica Menor</strong> - Escala más común para solos</li>
                <li><strong>Blues</strong> - Pentatónica con "blue note"</li>
                <li><strong>Cromática</strong> - Las 12 notas en orden</li>
            </ul>

            <h5>💡 Consejos:</h5>
            <ul>
                <li><strong>T</strong> = Tono (2 semitonos), <strong>S</strong> = Semitono (1 semitono)</li>
                <li>Practica las escalas lento primero, luego aumenta velocidad</li>
                <li>Usa la digitación correcta para fluidez</li>
                <li>Las escalas son la base de melodías e improvisación</li>
                <li>Puedes tocar en cualquier octava</li>
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
            localStorage.setItem('pianoMaestro_scalesMode_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats:', e);
        }
    },

    // Load stats
    loadStats() {
        try {
            const saved = localStorage.getItem('pianoMaestro_scalesMode_stats');
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
    module.exports = ScalesMode;
}
