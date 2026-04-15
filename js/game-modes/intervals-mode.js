/* ===================================
   Intervals Recognition Game Mode
   =================================== */

const IntervalsMode = {
    name: 'intervals',
    currentChallenge: null,
    stats: {
        streak: 0,
        correct: 0,
        total: 0,
        level: 1
    },
    isActive: false,
    currentlyPressed: new Set(),
    hasPlayedRoot: false,

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
        this.hasPlayedRoot = false;
    },

    // Generate new challenge
    generateChallenge() {
        const intervals = this.getAvailableIntervals();
        const randomInterval = intervals[Math.floor(Math.random() * intervals.length)];
        const rootNote = MusicTheory.getRandomNote(48, 65); // C3 to F4

        this.currentChallenge = {
            root: rootNote,
            target: rootNote + randomInterval,
            semitones: randomInterval,
            interval: MusicTheory.intervals[randomInterval]
        };

        this.currentlyPressed.clear();
        this.hasPlayedRoot = false;
        this.displayChallenge();
    },

    // Get available intervals based on level
    getAvailableIntervals() {
        const allIntervals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        // Gradually introduce more intervals
        const level = this.stats.level;
        if (level <= 2) return [2, 3, 4, 5, 7]; // Basic: 2M, 3m, 3M, 4J, 5J
        if (level <= 4) return [2, 3, 4, 5, 7, 8, 9, 12]; // Add 6th and octave
        if (level <= 6) return [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]; // Add 7ths
        return allIntervals; // All including tritone
    },

    // Display challenge
    displayChallenge() {
        const intervalInfo = this.currentChallenge.interval;
        const rootName = NotationSystem.midiToNoteName(this.currentChallenge.root);
        const targetName = NotationSystem.midiToNoteName(this.currentChallenge.target);

        UIController.updateChallengeDisplay(
            'Toca este intervalo:',
            intervalInfo.name,
            `${this.currentChallenge.semitones} semitonos`,
            `💡 Desde ${rootName} (${this.hasPlayedRoot ? '✓' : '⭕'}) hasta ${targetName}`
        );

        // Highlight both notes
        UIController.highlightKeys([this.currentChallenge.root, this.currentChallenge.target]);

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
            playSoundBtn.onclick = () => this.playCurrentInterval();
        }
    },

    // Check if answer is correct
    checkAnswer() {
        const pressed = Array.from(this.currentlyPressed);

        // Check if root is being played
        const rootPressed = pressed.some(note => note % 12 === this.currentChallenge.root % 12);
        const targetPressed = pressed.some(note => note % 12 === this.currentChallenge.target % 12);

        if (rootPressed) {
            this.hasPlayedRoot = true;
        }

        // Need both notes pressed
        if (pressed.length >= 2 && rootPressed && targetPressed) {
            this.stats.total++;
            this.handleCorrectAnswer();
        } else if (pressed.length >= 2 && this.hasPlayedRoot) {
            // Wrong interval
            this.stats.total++;
            this.handleWrongAnswer();
        }
    },

    // Handle correct answer
    handleCorrectAnswer() {
        this.stats.correct++;
        this.stats.streak++;

        // Level up every 10 correct answers
        if (this.stats.correct % 10 === 0) {
            this.stats.level++;
            UIController.showFeedback(`¡Nivel ${this.stats.level}! Intervalos más complejos 🎉`, 'success');
        } else {
            const messages = [
                '¡Intervalo perfecto! ✓',
                '¡Excelente oído! 🎵',
                '¡Precisión armónica! ⭐',
                '¡Muy bien! 👏',
                '¡Maestro de intervalos! 🔥'
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
        const actualInterval = Math.abs(pressed[1] - pressed[0]);
        const actualIntervalName = MusicTheory.intervals[actualInterval % 12]?.name || 'Desconocido';

        UIController.showFeedback(
            `Incorrecto. Tocaste ${actualIntervalName}, era ${this.currentChallenge.interval.name} ❌`,
            'error'
        );

        this.updateStatsDisplay();
        this.currentlyPressed.clear();
        this.hasPlayedRoot = false;
        this.displayChallenge();
    },

    // Play current interval
    playCurrentInterval() {
        // Play via Audio Engine or MIDI
        if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
            // Play root note first
            AudioEngine.playNote(this.currentChallenge.root, 100, 600);

            // Then play both together (harmonic interval)
            setTimeout(() => {
                AudioEngine.playNote(this.currentChallenge.root, 100, 1000);
                AudioEngine.playNote(this.currentChallenge.target, 100, 1000);
            }, 700);
        } else {
            // Fallback to MIDI
            MIDIController.playNote(this.currentChallenge.root, 600);
            setTimeout(() => {
                MIDIController.playNote(this.currentChallenge.root, 1000);
                MIDIController.playNote(this.currentChallenge.target, 1000);
            }, 700);
        }

        // Flash highlight
        UIController.clearHighlights();
        setTimeout(() => {
            UIController.highlightKeys([this.currentChallenge.root]);
        }, 100);
        setTimeout(() => {
            UIController.highlightKeys([this.currentChallenge.root, this.currentChallenge.target]);
        }, 800);
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
            <h4>🎶 Intervalos Musicales</h4>
            <p>Un intervalo es la distancia entre dos notas. Son la base de acordes y melodías.</p>

            <h5>Tipos de Intervalos:</h5>
            <ul>
                <li><strong>Unísono (0)</strong> - Misma nota</li>
                <li><strong>Segunda menor (1)</strong> - Medio tono, muy disonante</li>
                <li><strong>Segunda mayor (2)</strong> - Tono completo, suave</li>
                <li><strong>Tercera menor (3)</strong> - Base de acordes menores</li>
                <li><strong>Tercera mayor (4)</strong> - Base de acordes mayores</li>
                <li><strong>Cuarta justa (5)</strong> - Muy consonante</li>
                <li><strong>Tritono (6)</strong> - Máxima tensión, "diabólico"</li>
                <li><strong>Quinta justa (7)</strong> - Power chords, muy estable</li>
                <li><strong>Sexta menor (8)</strong> - Dulce</li>
                <li><strong>Sexta mayor (9)</strong> - Brillante</li>
                <li><strong>Séptima menor (10)</strong> - Tensión suave</li>
                <li><strong>Séptima mayor (11)</strong> - Tensión fuerte</li>
                <li><strong>Octava (12)</strong> - Misma nota, diferente altura</li>
            </ul>

            <h5>💡 Consejos:</h5>
            <ul>
                <li>Los intervalos pueden ser <strong>melódicos</strong> (sucesivos) o <strong>armónicos</strong> (simultáneos)</li>
                <li>Intervalos perfectos: Unísono, 4ª, 5ª, 8ª</li>
                <li>Los intervalos de 3ª y 6ª definen si un acorde es mayor o menor</li>
                <li>La 5ª justa es la base del rock (power chords)</li>
                <li>El tritono se evitaba en música medieval</li>
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
            localStorage.setItem('pianoMaestro_intervalsMode_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats:', e);
        }
    },

    // Load stats
    loadStats() {
        try {
            const saved = localStorage.getItem('pianoMaestro_intervalsMode_stats');
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
    module.exports = IntervalsMode;
}
