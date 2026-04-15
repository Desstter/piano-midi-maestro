/* ===================================
   Music Theory Module
   Complete music theory database
   =================================== */

const MusicTheory = {
    // MIDI note number to note name mapping
    midiNotes: {
        21: 'A0', 22: 'A#0', 23: 'B0',
        24: 'C1', 25: 'C#1', 26: 'D1', 27: 'D#1', 28: 'E1', 29: 'F1', 30: 'F#1', 31: 'G1', 32: 'G#1', 33: 'A1', 34: 'A#1', 35: 'B1',
        36: 'C2', 37: 'C#2', 38: 'D2', 39: 'D#2', 40: 'E2', 41: 'F2', 42: 'F#2', 43: 'G2', 44: 'G#2', 45: 'A2', 46: 'A#2', 47: 'B2',
        48: 'C3', 49: 'C#3', 50: 'D3', 51: 'D#3', 52: 'E3', 53: 'F3', 54: 'F#3', 55: 'G3', 56: 'G#3', 57: 'A3', 58: 'A#3', 59: 'B3',
        60: 'C4', 61: 'C#4', 62: 'D4', 63: 'D#4', 64: 'E4', 65: 'F4', 66: 'F#4', 67: 'G4', 68: 'G#4', 69: 'A4', 70: 'A#4', 71: 'B4',
        72: 'C5', 73: 'C#5', 74: 'D5', 75: 'D#5', 76: 'E5', 77: 'F5', 78: 'F#5', 79: 'G5', 80: 'G#5', 81: 'A5', 82: 'A#5', 83: 'B5',
        84: 'C6', 85: 'C#6', 86: 'D6', 87: 'D#6', 88: 'E6', 89: 'F6', 90: 'F#6', 91: 'G6', 92: 'G#6', 93: 'A6', 94: 'A#6', 95: 'B6',
        96: 'C7', 97: 'C#7', 98: 'D7', 99: 'D#7', 100: 'E7', 101: 'F7', 102: 'F#7', 103: 'G7', 104: 'G#7', 105: 'A7', 106: 'A#7', 107: 'B7',
        108: 'C8'
    },

    // Note names for a single octave
    noteNames: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    // Latin notation
    latinNotes: ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'],

    // Chord definitions (intervals from root)
    chords: {
        'Mayor': {
            intervals: [0, 4, 7],
            symbol: '',
            description: 'Acorde mayor - sonido alegre y brillante',
            example: 'Do Mayor = Do + Mi + Sol'
        },
        'Menor': {
            intervals: [0, 3, 7],
            symbol: 'm',
            description: 'Acorde menor - sonido triste y melancólico',
            example: 'Do menor = Do + Mi♭ + Sol'
        },
        'Séptima': {
            intervals: [0, 4, 7, 10],
            symbol: '7',
            description: 'Acorde de séptima dominante - tensión que resuelve',
            example: 'Do7 = Do + Mi + Sol + Si♭'
        },
        'Mayor Séptima': {
            intervals: [0, 4, 7, 11],
            symbol: 'maj7',
            description: 'Acorde mayor con séptima mayor - sonido jazz',
            example: 'Domaj7 = Do + Mi + Sol + Si'
        },
        'Menor Séptima': {
            intervals: [0, 3, 7, 10],
            symbol: 'm7',
            description: 'Acorde menor con séptima - sonido suave',
            example: 'Dom7 = Do + Mi♭ + Sol + Si♭'
        },
        'Disminuido': {
            intervals: [0, 3, 6],
            symbol: 'dim',
            description: 'Acorde disminuido - sonido tenso e inestable',
            example: 'Dodim = Do + Mi♭ + Sol♭'
        },
        'Aumentado': {
            intervals: [0, 4, 8],
            symbol: 'aug',
            description: 'Acorde aumentado - sonido misterioso',
            example: 'Doaug = Do + Mi + Sol#'
        },
        'Suspendido 2': {
            intervals: [0, 2, 7],
            symbol: 'sus2',
            description: 'Acorde suspendido con segunda - sonido abierto',
            example: 'Dosus2 = Do + Re + Sol'
        },
        'Suspendido 4': {
            intervals: [0, 5, 7],
            symbol: 'sus4',
            description: 'Acorde suspendido con cuarta - sonido suspendido',
            example: 'Dosus4 = Do + Fa + Sol'
        }
    },

    // Scale definitions
    scales: {
        'Mayor': {
            intervals: [0, 2, 4, 5, 7, 9, 11],
            description: 'Escala mayor - la más común en música occidental',
            pattern: 'T-T-S-T-T-T-S',
            example: 'Do Mayor: Do-Re-Mi-Fa-Sol-La-Si'
        },
        'Menor Natural': {
            intervals: [0, 2, 3, 5, 7, 8, 10],
            description: 'Escala menor natural - sonido triste y serio',
            pattern: 'T-S-T-T-S-T-T',
            example: 'La menor: La-Si-Do-Re-Mi-Fa-Sol'
        },
        'Menor Armónica': {
            intervals: [0, 2, 3, 5, 7, 8, 11],
            description: 'Escala menor armónica - sonido exótico y dramático',
            pattern: 'T-S-T-T-S-T½-S',
            example: 'La menor armónica: La-Si-Do-Re-Mi-Fa-Sol#'
        },
        'Menor Melódica': {
            intervals: [0, 2, 3, 5, 7, 9, 11],
            description: 'Escala menor melódica - ascendente, diferente descendente',
            pattern: 'T-S-T-T-T-T-S',
            example: 'La menor melódica: La-Si-Do-Re-Mi-Fa#-Sol#'
        },
        'Pentatónica Mayor': {
            intervals: [0, 2, 4, 7, 9],
            description: 'Escala pentatónica mayor - 5 notas, usada en blues y rock',
            pattern: 'T-T-T½-T-T½',
            example: 'Do pentatónica mayor: Do-Re-Mi-Sol-La'
        },
        'Pentatónica Menor': {
            intervals: [0, 3, 5, 7, 10],
            description: 'Escala pentatónica menor - sonido blues y rock',
            pattern: 'T½-T-T-T½-T',
            example: 'La pentatónica menor: La-Do-Re-Mi-Sol'
        },
        'Blues': {
            intervals: [0, 3, 5, 6, 7, 10],
            description: 'Escala blues - con blue note característica',
            pattern: 'T½-T-S-S-T½-T',
            example: 'Do blues: Do-Mi♭-Fa-Fa#-Sol-Si♭'
        },
        'Cromática': {
            intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            description: 'Escala cromática - todas las 12 notas',
            pattern: 'S-S-S-S-S-S-S-S-S-S-S-S',
            example: 'Do cromática: Do-Do#-Re-Re#-Mi-Fa-Fa#-Sol-Sol#-La-La#-Si'
        }
    },

    // Interval definitions
    intervals: {
        0: { name: 'Unísono', quality: 'Perfecto', semitones: 0, description: 'La misma nota' },
        1: { name: 'Segunda menor', quality: 'Menor', semitones: 1, description: 'Medio tono - sonido disonante' },
        2: { name: 'Segunda mayor', quality: 'Mayor', semitones: 2, description: 'Tono completo - sonido suave' },
        3: { name: 'Tercera menor', quality: 'Menor', semitones: 3, description: 'Sonido triste - base de acordes menores' },
        4: { name: 'Tercera mayor', quality: 'Mayor', semitones: 4, description: 'Sonido alegre - base de acordes mayores' },
        5: { name: 'Cuarta justa', quality: 'Perfecto', semitones: 5, description: 'Sonido estable y consonante' },
        6: { name: 'Tritono', quality: 'Aumentado/Disminuido', semitones: 6, description: 'Intervalo más disonante - "diabolus in musica"' },
        7: { name: 'Quinta justa', quality: 'Perfecto', semitones: 7, description: 'Muy consonante - power chords' },
        8: { name: 'Sexta menor', quality: 'Menor', semitones: 8, description: 'Sonido dulce y expresivo' },
        9: { name: 'Sexta mayor', quality: 'Mayor', semitones: 9, description: 'Sonido brillante y abierto' },
        10: { name: 'Séptima menor', quality: 'Menor', semitones: 10, description: 'Tensión suave - acordes de séptima' },
        11: { name: 'Séptima mayor', quality: 'Mayor', semitones: 11, description: 'Tensión fuerte - sonido jazz' },
        12: { name: 'Octava', quality: 'Perfecto', semitones: 12, description: 'Misma nota, diferente altura' }
    },

    // Helper functions
    getNoteFromMidi(midiNote) {
        return this.midiNotes[midiNote] || 'Unknown';
    },

    getMidiFromNoteName(noteName) {
        for (const [midi, name] of Object.entries(this.midiNotes)) {
            if (name === noteName) return parseInt(midi);
        }
        return null;
    },

    getNoteName(noteIndex) {
        return this.noteNames[noteIndex % 12];
    },

    getLatinNoteName(noteIndex) {
        return this.latinNotes[noteIndex % 12];
    },

    // Get notes in a chord
    getChordNotes(rootNote, chordType) {
        const chord = this.chords[chordType];
        if (!chord) return [];

        const rootMidi = typeof rootNote === 'number' ? rootNote : this.getMidiFromNoteName(rootNote);
        return chord.intervals.map(interval => rootMidi + interval);
    },

    // Get notes in a scale
    getScaleNotes(rootNote, scaleType) {
        const scale = this.scales[scaleType];
        if (!scale) return [];

        const rootMidi = typeof rootNote === 'number' ? rootNote : this.getMidiFromNoteName(rootNote);
        return scale.intervals.map(interval => rootMidi + interval);
    },

    // Calculate interval between two notes
    getInterval(note1, note2) {
        const midi1 = typeof note1 === 'number' ? note1 : this.getMidiFromNoteName(note1);
        const midi2 = typeof note2 === 'number' ? note2 : this.getMidiFromNoteName(note2);
        const semitones = Math.abs(midi2 - midi1) % 12;
        return this.intervals[semitones];
    },

    // Check if pressed notes match expected chord
    matchChord(pressedNotes, expectedNotes) {
        if (pressedNotes.length !== expectedNotes.length) return false;

        const sortedPressed = [...pressedNotes].sort((a, b) => a - b);
        const sortedExpected = [...expectedNotes].sort((a, b) => a - b);

        // Normalize to same octave
        const normalizeNote = note => note % 12;
        const normalizedPressed = sortedPressed.map(normalizeNote);
        const normalizedExpected = sortedExpected.map(normalizeNote);

        return normalizedPressed.every((note, i) => note === normalizedExpected[i]);
    },

    // Check if pressed notes match scale
    matchScale(pressedNotes, scaleNotes) {
        const normalizedPressed = pressedNotes.map(note => note % 12);
        const normalizedScale = scaleNotes.map(note => note % 12);

        return pressedNotes.every(note =>
            normalizedScale.includes(note % 12)
        );
    },

    // Generate random note in range
    getRandomNote(minMidi = 48, maxMidi = 72) {
        return Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
    },

    // Generate random chord
    getRandomChord() {
        const chordTypes = Object.keys(this.chords);
        const randomChord = chordTypes[Math.floor(Math.random() * chordTypes.length)];
        const rootNote = this.getRandomNote(48, 60); // C3 to C4
        return {
            root: rootNote,
            type: randomChord,
            notes: this.getChordNotes(rootNote, randomChord)
        };
    },

    // Generate random scale
    getRandomScale() {
        const scaleTypes = Object.keys(this.scales);
        const randomScale = scaleTypes[Math.floor(Math.random() * scaleTypes.length)];
        const rootNote = this.getRandomNote(48, 60);
        return {
            root: rootNote,
            type: randomScale,
            notes: this.getScaleNotes(rootNote, randomScale)
        };
    },

    // Generate random interval
    getRandomInterval() {
        const semitones = Math.floor(Math.random() * 12) + 1; // 1-12 semitones
        const rootNote = this.getRandomNote(48, 72);
        return {
            root: rootNote,
            target: rootNote + semitones,
            interval: this.intervals[semitones],
            semitones: semitones
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicTheory;
}
