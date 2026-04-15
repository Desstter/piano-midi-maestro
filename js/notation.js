/* ===================================
   Notation System Module
   Handles Latin/English notation conversion
   =================================== */

const NotationSystem = {
    currentNotation: 'latin', // 'latin', 'english', or 'both'

    // Conversion maps
    latinToEnglish: {
        'Do': 'C', 'Do#': 'C#', 'Dob': 'Cb',
        'Re': 'D', 'Re#': 'D#', 'Reb': 'Db',
        'Mi': 'E', 'Mi#': 'E#', 'Mib': 'Eb',
        'Fa': 'F', 'Fa#': 'F#', 'Fab': 'Fb',
        'Sol': 'G', 'Sol#': 'G#', 'Solb': 'Gb',
        'La': 'A', 'La#': 'A#', 'Lab': 'Ab',
        'Si': 'B', 'Si#': 'B#', 'Sib': 'Bb'
    },

    englishToLatin: {
        'C': 'Do', 'C#': 'Do#', 'Cb': 'Dob',
        'D': 'Re', 'D#': 'Re#', 'Db': 'Reb',
        'E': 'Mi', 'E#': 'Mi#', 'Eb': 'Mib',
        'F': 'Fa', 'F#': 'Fa#', 'Fb': 'Fab',
        'G': 'Sol', 'G#': 'Sol#', 'Gb': 'Solb',
        'A': 'La', 'A#': 'La#', 'Ab': 'Lab',
        'B': 'Si', 'B#': 'Si#', 'Bb': 'Sib'
    },

    // Chord suffix translations
    chordSuffixTranslations: {
        'Mayor': 'Major',
        'Menor': 'Minor',
        'Séptima': 'Seventh',
        'Mayor Séptima': 'Major Seventh',
        'Menor Séptima': 'Minor Seventh',
        'Disminuido': 'Diminished',
        'Aumentado': 'Augmented',
        'Suspendido 2': 'Suspended 2',
        'Suspendido 4': 'Suspended 4'
    },

    // Initialize
    init(notation = 'latin') {
        this.currentNotation = notation;
        this.loadFromStorage();
    },

    // Set notation type
    setNotation(type) {
        if (['latin', 'english', 'both'].includes(type)) {
            this.currentNotation = type;
            this.saveToStorage();
            return true;
        }
        return false;
    },

    // Get current notation
    getNotation() {
        return this.currentNotation;
    },

    // Convert MIDI note to display name
    midiToNoteName(midiNote, includeOctave = true) {
        const noteName = MusicTheory.getNoteFromMidi(midiNote);
        if (!noteName) return 'Unknown';

        // Split note and octave
        const match = noteName.match(/^([A-G]#?)(\d+)$/);
        if (!match) return noteName;

        const [, note, octave] = match;
        const displayNote = this.getDisplayNote(note);

        return includeOctave ? `${displayNote}${octave}` : displayNote;
    },

    // Get display note based on current notation
    getDisplayNote(englishNote) {
        switch (this.currentNotation) {
            case 'latin':
                return this.englishToLatin[englishNote] || englishNote;
            case 'english':
                return englishNote;
            case 'both':
                const latin = this.englishToLatin[englishNote] || englishNote;
                return { latin, english: englishNote };
            default:
                return englishNote;
        }
    },

    // Format note for display (handles both notation types)
    formatNoteDisplay(midiNote) {
        const noteName = MusicTheory.getNoteFromMidi(midiNote);
        if (!noteName) return { main: 'Unknown', alt: '' };

        const match = noteName.match(/^([A-G]#?)(\d+)$/);
        if (!match) return { main: noteName, alt: '' };

        const [, note, octave] = match;

        switch (this.currentNotation) {
            case 'latin':
                return {
                    main: this.englishToLatin[note] + octave,
                    alt: note + octave
                };
            case 'english':
                return {
                    main: note + octave,
                    alt: this.englishToLatin[note] + octave
                };
            case 'both':
                return {
                    main: this.englishToLatin[note] + octave,
                    alt: note + octave
                };
            default:
                return { main: noteName, alt: '' };
        }
    },

    // Format chord name
    formatChordName(rootMidiNote, chordType) {
        const rootName = this.midiToNoteName(rootMidiNote, false);
        const chordSymbol = MusicTheory.chords[chordType]?.symbol || '';

        if (this.currentNotation === 'both') {
            const latin = typeof rootName === 'object' ? rootName.latin : rootName;
            const english = typeof rootName === 'object' ? rootName.english : rootName;
            return {
                main: `${latin}${chordSymbol}`,
                alt: `${english}${chordSymbol}`
            };
        }

        const displayRoot = typeof rootName === 'object' ? rootName.latin : rootName;
        return {
            main: `${displayRoot}${chordSymbol}`,
            alt: chordType
        };
    },

    // Format scale name
    formatScaleName(rootMidiNote, scaleType) {
        const rootName = this.midiToNoteName(rootMidiNote, false);

        if (this.currentNotation === 'both') {
            const latin = typeof rootName === 'object' ? rootName.latin : rootName;
            const english = typeof rootName === 'object' ? rootName.english : rootName;
            return {
                main: `${latin} ${scaleType}`,
                alt: `${english} ${scaleType}`
            };
        }

        const displayRoot = typeof rootName === 'object' ? rootName.latin : rootName;
        return {
            main: `${displayRoot} ${scaleType}`,
            alt: scaleType
        };
    },

    // Format interval name
    formatIntervalName(semitones) {
        const interval = MusicTheory.intervals[semitones];
        if (!interval) return { main: 'Unknown', alt: '' };

        return {
            main: interval.name,
            alt: `${semitones} semitonos`
        };
    },

    // Convert note name to MIDI (supports both notations)
    noteNameToMidi(noteName, octave = 4) {
        // Try English first
        let englishNote = noteName;

        // If it's Latin, convert to English
        if (this.latinToEnglish[noteName]) {
            englishNote = this.latinToEnglish[noteName];
        }

        const fullNoteName = englishNote + octave;
        return MusicTheory.getMidiFromNoteName(fullNoteName);
    },

    // Get all note names in current notation
    getAllNoteNames() {
        const notes = [];
        for (let i = 0; i < 12; i++) {
            const englishNote = MusicTheory.noteNames[i];
            notes.push(this.getDisplayNote(englishNote));
        }
        return notes;
    },

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('pianoMaestro_notation', this.currentNotation);
        } catch (e) {
            console.warn('Could not save notation preference:', e);
        }
    },

    // Load from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('pianoMaestro_notation');
            if (saved && ['latin', 'english', 'both'].includes(saved)) {
                this.currentNotation = saved;
            }
        } catch (e) {
            console.warn('Could not load notation preference:', e);
        }
    },

    // Helper to display note in UI
    updateNoteDisplay(elementMain, elementAlt, midiNote) {
        const display = this.formatNoteDisplay(midiNote);
        if (elementMain) elementMain.textContent = display.main;
        if (elementAlt) {
            elementAlt.textContent = display.alt;
            elementAlt.style.display = this.currentNotation === 'both' ? 'block' : 'none';
        }
    }
};

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        NotationSystem.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotationSystem;
}
