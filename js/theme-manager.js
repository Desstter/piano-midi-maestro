/* ===================================
   Theme Manager Module
   Manages visual themes
   =================================== */

const ThemeManager = {
    currentTheme: 'modern',
    themes: ['modern', 'colorful', 'classic'],

    // Initialize
    init() {
        this.loadFromStorage();
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    },

    // Apply theme
    applyTheme(themeName) {
        if (!this.themes.includes(themeName)) {
            console.warn(`Theme "${themeName}" not found`);
            return false;
        }

        const themeLink = document.getElementById('theme-link');
        if (themeLink) {
            themeLink.href = `css/themes/${themeName}.css`;
        }

        this.currentTheme = themeName;
        this.updateThemeButtons();
        this.saveToStorage();

        // Add theme class to body for additional styling
        document.body.className = `theme-${themeName}`;

        return true;
    },

    // Setup event listeners
    setupEventListeners() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                if (theme) {
                    this.applyTheme(theme);
                }
            });
        });
    },

    // Update button states
    updateThemeButtons() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === this.currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // Get current theme
    getTheme() {
        return this.currentTheme;
    },

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('pianoMaestro_theme', this.currentTheme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    },

    // Load from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('pianoMaestro_theme');
            if (saved && this.themes.includes(saved)) {
                this.currentTheme = saved;
            }
        } catch (e) {
            console.warn('Could not load theme preference:', e);
        }
    }
};

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
