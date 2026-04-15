/* ===================================
   Piano MIDI Maestro - Main App
   Entry point and mode management
   =================================== */

const App = {
    currentMode: null,
    modes: {
        notes: NotesMode,
        chords: ChordsMode,
        scales: ScalesMode,
        intervals: IntervalsMode
    },
    isInitialized: false,

    // Initialize the application
    async init() {
        console.log('🎹 Piano MIDI Maestro - Initializing...');

        try {
            // Initialize all modules
            await this.initializeModules();

            // Setup mode switching
            this.setupModeButtons();

            // Start with notes mode
            this.switchMode('notes');

            this.isInitialized = true;
            console.log('✅ Piano MIDI Maestro - Ready!');

            // Show welcome message
            this.showWelcomeMessage();
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Error al inicializar la aplicación. Por favor, recarga la página.');
        }
    },

    // Initialize all modules
    async initializeModules() {
        console.log('Initializing modules...');

        // Initialize Audio Engine (will load on first user interaction)
        if (typeof AudioEngine !== 'undefined') {
            console.log('Audio Engine module loaded, will initialize on user interaction');
            // Show loading indicator when audio starts loading
            this.setupAudioLoadingIndicator();
        }

        // Initialize MIDI Controller
        const midiSuccess = await MIDIController.init();
        if (!midiSuccess) {
            console.warn('MIDI not available, app will work in visual mode');
        }

        // Initialize UI Controller
        UIController.init();

        // Initialize Theme Manager
        ThemeManager.init();

        // Initialize Notation System
        NotationSystem.init();

        console.log('All modules initialized');
    },

    // Setup audio loading indicator
    setupAudioLoadingIndicator() {
        // Listen for when audio starts loading
        const originalLoadSamples = AudioEngine.loadSamples;
        AudioEngine.loadSamples = async function(onProgress) {
            const indicator = document.getElementById('audio-loading-status');
            if (indicator) {
                indicator.style.display = 'block';
            }

            return originalLoadSamples.call(AudioEngine, (loaded, total) => {
                const percent = Math.round((loaded / total) * 100);
                if (indicator) {
                    indicator.textContent = `🎵 Cargando sonidos de piano... ${percent}%`;
                }

                if (percent === 100) {
                    setTimeout(() => {
                        if (indicator) {
                            indicator.style.display = 'none';
                        }
                    }, 2000);
                }

                if (onProgress) onProgress(loaded, total);
            });
        };
    },

    // Setup mode switching buttons
    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');

        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (mode && this.modes[mode]) {
                    this.switchMode(mode);
                }
            });
        });
    },

    // Switch game mode
    switchMode(modeName) {
        if (!this.modes[modeName]) {
            console.error(`Mode "${modeName}" not found`);
            return false;
        }

        // Stop current mode
        if (this.currentMode) {
            this.currentMode.stop();
        }

        // Update button states
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === modeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Start new mode
        this.currentMode = this.modes[modeName];
        this.currentMode.start();

        // Store current mode globally for notation updates
        window.currentGameMode = this.currentMode;

        console.log(`Switched to ${modeName} mode`);
        return true;
    },

    // Show welcome message
    showWelcomeMessage() {
        const midiStatus = MIDIController.selectedInput ? 'conectado' : 'no detectado';

        UIController.showFeedback(
            `¡Bienvenido a Piano MIDI Maestro! MIDI: ${midiStatus}`,
            'success'
        );

        // If no MIDI, show helpful message
        if (!MIDIController.selectedInput) {
            setTimeout(() => {
                UIController.updateChallengeDisplay(
                    '👋 Bienvenido',
                    'Conecta tu teclado MIDI',
                    'Para comenzar a practicar',
                    '💡 Conecta tu teclado MIDI de 32 teclas y recarga la página, o practica visualmente'
                );
            }, 2000);
        }
    },

    // Show error message
    showError(message) {
        const feedbackEl = document.getElementById('feedback');
        if (feedbackEl) {
            feedbackEl.innerHTML = `
                <div class="feedback-message error">
                    ❌ ${message}
                </div>
            `;
        }
    },

    // Get current mode
    getCurrentMode() {
        return this.currentMode;
    },

    // Get app info
    getInfo() {
        return {
            version: '1.0.0',
            currentMode: this.currentMode?.name || null,
            midiConnected: !!MIDIController.selectedInput,
            theme: ThemeManager.getTheme(),
            notation: NotationSystem.getNotation()
        };
    }
};

// Initialize app when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });

    // Log app info to console
    window.PianoMaestro = App;
    console.log(`
╔════════════════════════════════════╗
║   🎹 Piano MIDI Maestro v1.0.0    ║
║   Tu maestro personal de piano     ║
╚════════════════════════════════════╝

Comandos de consola:
- PianoMaestro.getInfo()        Ver información de la app
- PianoMaestro.switchMode(name) Cambiar modo manualmente
- MIDIController.getDeviceInfo() Ver dispositivos MIDI

Modos disponibles:
- notes      Reconocimiento de notas
- chords     Acordes
- scales     Escalas
- intervals  Intervalos
    `);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
