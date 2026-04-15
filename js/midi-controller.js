/* ===================================
   MIDI Controller Module
   Web MIDI API implementation
   =================================== */

const MIDIController = {
    midiAccess: null,
    inputs: [],
    outputs: [],
    selectedInput: null,
    pressedNotes: new Set(),
    listeners: {
        noteOn: [],
        noteOff: [],
        statusChange: []
    },

    // Initialize MIDI
    async init() {
        if (!navigator.requestMIDIAccess) {
            console.error('Web MIDI API not supported in this browser');
            this.updateStatus('disconnected', 'MIDI no soportado en este navegador');
            return false;
        }

        try {
            this.updateStatus('connecting', 'Conectando MIDI...');
            this.midiAccess = await navigator.requestMIDIAccess();

            // Listen for device connections/disconnections
            this.midiAccess.onstatechange = (e) => this.onStateChange(e);

            // Get initial devices
            this.refreshDevices();

            if (this.inputs.length > 0) {
                this.selectInput(this.inputs[0]);
                this.updateStatus('connected', `Conectado: ${this.inputs[0].name}`);
                return true;
            } else {
                this.updateStatus('disconnected', 'No se detectó ningún dispositivo MIDI');
                return false;
            }
        } catch (error) {
            console.error('Error initializing MIDI:', error);
            this.updateStatus('disconnected', 'Error al inicializar MIDI');
            return false;
        }
    },

    // Refresh device list
    refreshDevices() {
        if (!this.midiAccess) return;

        this.inputs = Array.from(this.midiAccess.inputs.values());
        this.outputs = Array.from(this.midiAccess.outputs.values());

        // Update device select dropdown
        this.updateDeviceSelect();
    },

    // Handle device state changes
    onStateChange(event) {
        console.log('MIDI device state changed:', event.port.name, event.port.state);
        this.refreshDevices();

        if (event.port.state === 'connected' && event.port.type === 'input') {
            if (!this.selectedInput) {
                this.selectInput(event.port);
            }
            this.updateStatus('connected', `Conectado: ${event.port.name}`);
        } else if (event.port.state === 'disconnected' && event.port === this.selectedInput) {
            this.updateStatus('disconnected', 'Dispositivo MIDI desconectado');
            this.selectInput(this.inputs[0] || null);
        }

        // Notify listeners
        this.notifyListeners('statusChange', {
            port: event.port,
            state: event.port.state
        });
    },

    // Select input device
    selectInput(input) {
        // Remove previous listener
        if (this.selectedInput) {
            this.selectedInput.onmidimessage = null;
        }

        this.selectedInput = input;

        if (input) {
            input.onmidimessage = (message) => this.onMIDIMessage(message);
            this.updateStatus('connected', `Conectado: ${input.name}`);
        }
    },

    // Handle MIDI messages
    onMIDIMessage(message) {
        const [status, note, velocity] = message.data;
        const command = status >> 4;
        const channel = status & 0xf;

        switch (command) {
            case 9: // Note On
                if (velocity > 0) {
                    this.handleNoteOn(note, velocity);
                } else {
                    this.handleNoteOff(note);
                }
                break;
            case 8: // Note Off
                this.handleNoteOff(note);
                break;
        }
    },

    // Handle note on
    handleNoteOn(note, velocity) {
        this.pressedNotes.add(note);
        console.log('Note ON:', note, MusicTheory.getNoteFromMidi(note), 'Velocity:', velocity);

        // Play sound through Audio Engine
        if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
            AudioEngine.playNote(note, velocity);
        }

        // Notify listeners
        this.notifyListeners('noteOn', {
            note: note,
            noteName: MusicTheory.getNoteFromMidi(note),
            velocity: velocity,
            pressedNotes: Array.from(this.pressedNotes)
        });
    },

    // Handle note off
    handleNoteOff(note) {
        this.pressedNotes.delete(note);
        console.log('Note OFF:', note, MusicTheory.getNoteFromMidi(note));

        // Stop sound through Audio Engine
        if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
            AudioEngine.stopNote(note);
        }

        // Notify listeners
        this.notifyListeners('noteOff', {
            note: note,
            noteName: MusicTheory.getNoteFromMidi(note),
            pressedNotes: Array.from(this.pressedNotes)
        });
    },

    // Add event listener
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    },

    // Remove event listener
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    },

    // Notify all listeners of an event
    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    },

    // Update status UI
    updateStatus(status, message) {
        const statusBtn = document.getElementById('midi-status');
        const statusText = statusBtn?.querySelector('.status-text');

        if (statusBtn) {
            statusBtn.className = 'midi-status ' + status;
        }

        if (statusText) {
            statusText.textContent = message;
        }
    },

    // Update device select dropdown
    updateDeviceSelect() {
        const select = document.getElementById('midi-device-select');
        if (!select) return;

        select.innerHTML = '';

        if (this.inputs.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No se detectaron dispositivos MIDI';
            select.appendChild(option);
            return;
        }

        this.inputs.forEach((input, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = input.name || `Dispositivo ${index + 1}`;
            if (input === this.selectedInput) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // Handle device selection change
        select.onchange = (e) => {
            const inputIndex = parseInt(e.target.value);
            if (this.inputs[inputIndex]) {
                this.selectInput(this.inputs[inputIndex]);
            }
        };
    },

    // Get currently pressed notes
    getPressedNotes() {
        return Array.from(this.pressedNotes);
    },

    // Check if specific note is pressed
    isNotePressed(note) {
        return this.pressedNotes.has(note);
    },

    // Clear all pressed notes (useful for reset)
    clearPressedNotes() {
        this.pressedNotes.clear();
    },

    // Send MIDI message (if output is available)
    sendNoteOn(note, velocity = 127, channel = 0) {
        if (this.outputs.length > 0) {
            const status = 0x90 | channel;
            this.outputs[0].send([status, note, velocity]);
        }
    },

    sendNoteOff(note, channel = 0) {
        if (this.outputs.length > 0) {
            const status = 0x80 | channel;
            this.outputs[0].send([status, note, 0]);
        }
    },

    // Play note for duration (with output or audio engine)
    playNote(note, duration = 500, velocity = 127) {
        // Use Audio Engine if available
        if (typeof AudioEngine !== 'undefined' && AudioEngine.isReady()) {
            AudioEngine.playNote(note, velocity, duration);
        } else {
            // Fallback to MIDI output if available
            this.sendNoteOn(note, velocity);
            setTimeout(() => this.sendNoteOff(note), duration);
        }
    },

    // Get device info
    getDeviceInfo() {
        return {
            inputs: this.inputs.map(input => ({
                id: input.id,
                name: input.name,
                manufacturer: input.manufacturer,
                state: input.state
            })),
            outputs: this.outputs.map(output => ({
                id: output.id,
                name: output.name,
                manufacturer: output.manufacturer,
                state: output.state
            })),
            selectedInput: this.selectedInput ? {
                id: this.selectedInput.id,
                name: this.selectedInput.name
            } : null
        };
    }
};

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        await MIDIController.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MIDIController;
}
