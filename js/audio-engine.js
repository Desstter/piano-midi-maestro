/* ===================================
   Audio Engine Module
   Web Audio API implementation for realistic piano sounds
   =================================== */

const AudioEngine = {
    audioContext: null,
    masterGain: null,
    isInitialized: false,
    isLoading: false,
    samples: new Map(), // Map of MIDI note -> AudioBuffer
    activeSources: new Map(), // Map of note -> playing sources

    // Configuration
    config: {
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        // Sample every 3 semitones for efficient loading
        // These are the exact notes available in the Salamander CDN
        sampleNotes: [21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99, 102, 105, 108],
        attackTime: 0.001,
        releaseTime: 0.3,
        volume: 0.7
    },

    // Initialize audio context
    async init() {
        if (this.isInitialized) return true;

        try {
            // Create audio context (require user interaction)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.config.volume;
            this.masterGain.connect(this.audioContext.destination);

            this.isInitialized = true;
            console.log('✅ Audio Engine initialized');
            return true;
        } catch (error) {
            console.error('❌ Error initializing Audio Engine:', error);
            return false;
        }
    },

    // Load piano samples
    async loadSamples(onProgress = null) {
        if (this.isLoading) return;
        if (!this.isInitialized) {
            await this.init();
        }

        this.isLoading = true;
        console.log('Loading piano samples...');

        try {
            const totalSamples = this.config.sampleNotes.length;
            let loadedSamples = 0;

            // Load one sample per note (no velocity layers in CDN)
            for (const midiNote of this.config.sampleNotes) {
                const noteName = this.midiToNoteName(midiNote);
                const url = `${this.config.baseUrl}${noteName}.mp3`;

                try {
                    const buffer = await this.loadAudioBuffer(url);

                    // Store with MIDI note as key
                    this.samples.set(midiNote, buffer);

                    loadedSamples++;

                    // Report progress
                    if (onProgress) {
                        onProgress(loadedSamples, totalSamples);
                    }
                } catch (error) {
                    console.warn(`Could not load sample: ${url}`, error);
                }
            }

            console.log(`✅ Loaded ${loadedSamples}/${totalSamples} piano samples`);
            this.isLoading = false;
            return true;
        } catch (error) {
            console.error('❌ Error loading samples:', error);
            this.isLoading = false;
            return false;
        }
    },

    // Load single audio buffer from URL
    async loadAudioBuffer(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    },

    // Convert MIDI note number to note name
    midiToNoteName(midiNote) {
        const noteNames = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = noteNames[midiNote % 12];
        return `${noteName}${octave}`;
    },

    // Find closest sample for a given MIDI note
    findClosestSample(midiNote) {
        let closest = this.config.sampleNotes[0];
        let minDistance = Math.abs(midiNote - closest);

        for (const sampleNote of this.config.sampleNotes) {
            const distance = Math.abs(midiNote - sampleNote);
            if (distance < minDistance) {
                minDistance = distance;
                closest = sampleNote;
            }
        }

        return closest;
    },

    // Calculate detune in cents for pitch shifting
    calculateDetune(targetNote, sampleNote) {
        return (targetNote - sampleNote) * 100; // 100 cents per semitone
    },

    // Play a note
    playNote(midiNote, velocity = 127, duration = null) {
        if (!this.isInitialized || this.samples.size === 0) {
            console.warn('Audio Engine not ready');
            return null;
        }

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Find closest sample
        const closestSample = this.findClosestSample(midiNote);
        const detune = this.calculateDetune(midiNote, closestSample);

        // Get sample buffer (stored by MIDI note number)
        const buffer = this.samples.get(closestSample);

        if (!buffer) {
            console.warn(`Sample not found for note: ${closestSample}`);
            return null;
        }

        // Create source node
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.detune.value = detune;

        // Create gain node for this note
        const gainNode = this.audioContext.createGain();
        const normalizedVelocity = velocity / 127;
        gainNode.gain.value = normalizedVelocity;

        // Connect: source -> gain -> master -> destination
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Start playing
        const now = this.audioContext.currentTime;
        source.start(now);

        // Store active source
        this.activeSources.set(midiNote, { source, gainNode, startTime: now });

        // Auto-stop if duration specified
        if (duration) {
            setTimeout(() => this.stopNote(midiNote), duration);
        }

        return source;
    },

    // Stop a note (with release envelope)
    stopNote(midiNote, releaseTime = null) {
        const active = this.activeSources.get(midiNote);
        if (!active) return;

        const { source, gainNode } = active;
        const now = this.audioContext.currentTime;
        const release = releaseTime || this.config.releaseTime;

        // Fade out
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + release);

        // Stop and cleanup
        source.stop(now + release);

        setTimeout(() => {
            this.activeSources.delete(midiNote);
        }, release * 1000);
    },

    // Stop all notes (panic button)
    stopAll() {
        for (const [midiNote] of this.activeSources) {
            this.stopNote(midiNote, 0.05); // Quick release
        }
    },

    // Play chord (multiple notes)
    playChord(midiNotes, velocity = 127, duration = null, arpeggio = false) {
        if (arpeggio) {
            // Play notes with slight delay (arpeggio effect)
            midiNotes.forEach((note, index) => {
                setTimeout(() => {
                    this.playNote(note, velocity, duration);
                }, index * 50); // 50ms between notes
            });
        } else {
            // Play all notes simultaneously
            midiNotes.forEach(note => {
                this.playNote(note, velocity, duration);
            });
        }
    },

    // Play scale (sequence of notes)
    playScale(midiNotes, velocity = 127, noteDuration = 400) {
        midiNotes.forEach((note, index) => {
            setTimeout(() => {
                this.playNote(note, velocity, noteDuration * 0.8);
            }, index * noteDuration);
        });
    },

    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        if (this.masterGain) {
            this.config.volume = Math.max(0, Math.min(1, volume));
            this.masterGain.gain.setValueAtTime(
                this.config.volume,
                this.audioContext.currentTime
            );
        }
    },

    // Get current volume
    getVolume() {
        return this.config.volume;
    },

    // Check if audio is ready
    isReady() {
        return this.isInitialized && this.samples.size > 0 && !this.isLoading;
    },

    // Get loading status
    getStatus() {
        if (this.isLoading) return 'loading';
        if (!this.isInitialized) return 'not_initialized';
        if (this.samples.size === 0) return 'no_samples';
        return 'ready';
    }
};

// Initialize on user interaction (required for autoplay policy)
if (typeof document !== 'undefined') {
    // Wait for first user interaction
    const initAudioOnInteraction = async () => {
        await AudioEngine.init();

        // Load samples in background
        AudioEngine.loadSamples((loaded, total) => {
            const percent = Math.round((loaded / total) * 100);
            console.log(`Loading piano samples: ${percent}%`);

            // Update UI if available
            const loadingEl = document.getElementById('audio-loading-status');
            if (loadingEl) {
                loadingEl.textContent = `Cargando sonidos: ${percent}%`;
                if (percent === 100) {
                    setTimeout(() => {
                        loadingEl.style.display = 'none';
                    }, 1000);
                }
            }
        });

        // Remove listeners after first interaction
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('keydown', initAudioOnInteraction);
        document.removeEventListener('touchstart', initAudioOnInteraction);
    };

    document.addEventListener('click', initAudioOnInteraction, { once: true });
    document.addEventListener('keydown', initAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', initAudioOnInteraction, { once: true });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
