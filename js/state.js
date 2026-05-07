// WorkView - State Management
// Powered by MiraTech Industries

class StateManager {
    constructor() {
        this.state = new Map();
        this.listeners = new Map();
        this.initialized = false;
    }

    set(key, value) {
        const oldValue = this.state.get(key);
        this.state.set(key, value);
        
        // Notify listeners
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(value, oldValue);
            });
        }
        
        // Persist to localStorage for key items
        if (['user', 'userData', 'settings'].includes(key)) {
            try {
                localStorage.setItem(`workview_${key}`, JSON.stringify(value));
            } catch (e) {
                console.warn('Could not persist state to localStorage');
            }
        }
    }

    get(key) {
        return this.state.get(key);
    }

    getAll() {
        return Object.fromEntries(this.state);
    }

    on(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    off(key, callback) {
        if (this.listeners.has(key)) {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    async initialize() {
        if (this.initialized) return;

        // Restore persisted state
        const keys = ['user', 'userData', 'settings'];
        keys.forEach(key => {
            try {
                const stored = localStorage.getItem(`workview_${key}`);
                if (stored) {
                    this.state.set(key, JSON.parse(stored));
                }
            } catch (e) {
                console.warn(`Could not restore ${key} from localStorage`);
            }
        });

        // Load default settings if not present
        if (!this.state.has('settings')) {
            this.state.set('settings', {
                vatRate: 15,
                brandColor: '#1e90ff',
                businessName: 'WorkView',
                letterheadUrl: ''
            });
        }

        // Initialize data caches
        this.state.set('documents', []);
        this.state.set('customers', []);
        this.state.set('products', []);
        this.state.set('subscriptions', []);
        this.state.set('users', []);

        this.initialized = true;
        console.log('State manager initialized');
    }

    clear() {
        this.state.clear();
        this.listeners.clear();
        localStorage.removeItem('workview_user');
        localStorage.removeItem('workview_userData');
        localStorage.removeItem('workview_settings');
        this.initialized = false;
    }
}

// Create global instance
window.state = new StateManager();

// Initialize state
document.addEventListener('DOMContentLoaded', () => {
    window.state.initialize();
});