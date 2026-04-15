/* ===================================
   Chords Recognition Game Mode
   =================================== */

const ChordsMode = {
    name: 'chords',
    currentChallenge: null,
    stats: {
        streak: 0,
        correct: 0,
        total: 0,
        level: 1
    },
    isActive: false,
    currentlyPressed: new Set(),

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
        MIDIController.off('noteOn', this.onNoteOn);
        MIDIController.off('noteOff', this.onNoteOff);
        this.currentlyPressed.clear();
    },

    // Generate new challenge
    generateChallenge() {
        const chordTypes = this.getAvailableChordTypes();
        const randomChordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
        const rootNote = MusicTheory.getRandomNote(48, 60); // C3 to C4

        this.currentChallenge = {
            root: rootNote,
            type: randomChordType,
            notes: MusicTheory.getChordNotes(rootNote, randomChordType)
        };

        this.currentlyPressed.clear();
        this.displayChallenge();
    },

    // Get available chord types based on level
    getAvailableChordTypes() {
        const allChords = [
            'Mayor',
            'Menor',
            'Séptima',
            'Mayor Séptima',
            'Menor Séptima',
            'Disminuido',
            'Aumentado',
            'Suspendido 2',
            'Suspendido 4'
        ];

        // Gradually introduce more complex chords
        const level = this.stats.level;
        if (level <= 2) return ['Mayor', 'Menor'];
        if (level <= 4) return ['Mayor', 'Menor', 'Séptima'];
        if (level <= 6) return ['Mayor', 'Menor', 'Séptima', 'Mayor Séptima', 'Menor Séptima'];
        return allChords;
    },

    // Display challenge
    displayChallenge() {
        const display = NotationSystem.formatChordName(
            this.currentChallenge.root,
            this.currentChallenge.type
        );

        const chordInfo = MusicTheory.chords[this.currentChallenge.type];
        const noteNames = this.currentChallenge.notes.map(note =>
            NotationSystem.midiToNoteName(note)
        ).join(' + ');

        UIController.updateChallengeDisplay(
            'Toca este acorde:',
            display.main,
            display.alt || chordInfo?.description || '',
            `💡 Notas: ${noteNames}`
        );

        // Highlight the chord notes
        UIController.highlightKeys(this.currentChallenge.notes);

        // Update stats display
        this.updateStatsDisplay();
    },

    // Setup MIDI listeners
    setupListeners() {
        this.onNoteOn = (data) => {
            if (!this.isActive) return;
            this.currentlyPressed.add(data.note);
            this.checkAnswer();
        };

        this.onNoteOff = (data) => {
            if (!this.isActive) return;
            this.currentlyPressed.delete(data.note);
        };

        MIDIController.on('noteOn', this.onNoteOn);
        MIDIController.on('noteOff', this.onNoteOff);

        // Next button
        const nextBtn = document.getElementById('next-challenge');
        if (nextBtn) {
            nextBtn.onclick = () => this.generateChallenge();
        }

        // Play sound button
        const playSoundBtn = document.getElementById('play-sound');
        if (playSoundBtn) {
            playSoundBtn.onclick = () => this.playCurrentChord();
        }
    },

    // Check if answer is correct
    checkAnswer() {
        const pressed = Array.from(this.currentlyPressed);

        // Need to press all notes
        if (pressed.length < this.currentChallenge.notes.length) {
            return; // Not all notes pressed yet
        }

        this.stats.total++;

        if (MusicTheory.matchChord(pressed, this.currentChallenge.notes)) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    },

    // Handle correct answer
    handleCorrectAnswer() {
        this.stats.correct++;
        this.stats.streak++;

        // Level up every 8 correct answers
        if (this.stats.correct % 8 === 0) {
            this.stats.level++;
            UIController.showFeedback(`¡Nivel ${this.stats.level}! Acordes más complejos 🎉`, 'success');
        } else {
            const messages = [
                '¡Acorde perfecto! ✓',
                '¡Excelente armonía! 🎵',
                '¡Sonó genial! ⭐',
                '¡Muy bien! 👏',
                '¡Eres un maestro! 🔥'
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
    handleWrongAnswer() {
        this.stats.streak = 0;

        const pressed = Array.from(this.currentlyPressed);
        const pressedNames = pressed.map(n => NotationSystem.midiToNoteName(n)).join(', ');
        const correctNames = this.currentChallenge.notes.map(n =>
            NotationSystem.midiToNoteName(n)
        ).join(', ');

        UIController.showFeedback(
            `Incorrecto. Tocaste: ${pressedNames}. Correcto: ${correctNames} ❌`,
            'error'
        );

        this.updateStatsDisplay();
        this.currentlyPressed.clear();
    },

    // Play current chord
    playCurrentChord() {
        // Flash highlight
        UIController.clearHighlights();
        setTimeout(() => {
            UIController.highlightKeys(this.currentChallenge.notes);
        }, 100);

        // Play chord via Audio Engine or MIDI
        if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
            // Play with arpeggio effect
            this.currentChallenge.notes.forEach((note, index) => {
                setTimeout(() => {
                    AudioEngine.playNote(note, 100, 800);
                }, index * 150);
            });
        } else {
            // Fallback to MIDI
            this.currentChallenge.notes.forEach((note, index) => {
                setTimeout(() => {
                    MIDIController.playNote(note, 800);
                }, index * 150);
            });
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
            <h4>🎼 Acordes Musicales</h4>
            <p>Un acorde es la combinación de 3 o más notas tocadas simultáneamente.</p>

            <h5>Tipos de Acordes:</h5>
            <ul>
                <li><strong>Mayor</strong> - Sonido alegre (Do + Mi + Sol)</li>
                <li><strong>Menor (m)</strong> - Sonido triste (Do + Mi♭ + Sol)</li>
                <li><strong>Séptima (7)</strong> - Tensión dominante (Do + Mi + Sol + Si♭)</li>
                <li><strong>Mayor Séptima (maj7)</strong> - Sonido jazz (Do + Mi + Sol + Si)</li>
                <li><strong>Menor Séptima (m7)</strong> - Suave (Do + Mi♭ + Sol + Si♭)</li>
                <li><strong>Disminuido (dim)</strong> - Tenso (Do + Mi♭ + Sol♭)</li>
                <li><strong>Aumentado (aug)</strong> - Misterioso (Do + Mi + Sol#)</li>
                <li><strong>Sus2/Sus4</strong> - Suspendido, sonido abierto</li>
            </ul>

            <h5>💡 Consejos:</h5>
            <ul>
                <li>Los acordes mayores suenan felices y brillantes</li>
                <li>Los acordes menores suenan tristes y melancólicos</li>
                <li>La diferencia entre mayor y menor es de 1 semitono (tercera)</li>
                <li>Practica cambiar entre acordes suavemente</li>
                <li>Puedes tocar las notas en cualquier octava</li>
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
            localStorage.setItem('pianoMaestro_chordsMode_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats:', e);
        }
    },

    // Load stats
    loadStats() {
        try {
            const saved = localStorage.getItem('pianoMaestro_chordsMode_stats');
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
    module.exports = ChordsMode;
}
