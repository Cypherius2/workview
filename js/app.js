// WorkView - Main Application
// Powered by MiraTech Industries

class Router {
    constructor() {
        this.routes = {
            'dashboard': 'page-dashboard',
            'documents': 'page-documents',
            'customers': 'page-customers',
            'products': 'page-products',
            'settings': 'page-settings',
            'admin-users': 'page-admin-users',
            'admin-subscriptions': 'page-admin-subscriptions',
            'admin-settings': 'page-admin-settings',
            'admin-logs': 'page-admin-logs',
            'login': 'login-modal',
            'register': 'register-modal'
        };
        this.currentPage = null;
    }

    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();

        // Set up navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.dataset.page;
                if (page) {
                    e.preventDefault();
                    this.navigate(page);
                }
            });
        });
    }

    handleRoute() {
        let hash = window.location.hash.slice(1) || 'dashboard';
        
        // Check if user is authenticated
        const user = window.state.get('user');
        const isAuthPage = hash === 'login' || hash === 'register';
        
        if (!user && !isAuthPage && !window.location.hash) {
            // Show login modal if not authenticated
            this.navigate('login');
            return;
        }

        this.navigate(hash);
    }

    navigate(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        // Show target page
        const pageId = this.routes[page];
        if (pageId) {
            const element = document.getElementById(pageId);
            if (element) {
                element.classList.remove('hidden');
                this.currentPage = page;
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    if (link.dataset.page === page) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Initialize page module
                this.initPage(page);
                
                // Scroll to top
                window.scrollTo(0, 0);
            }
        }

        // Handle auth pages
        if (page === 'login' || page === 'register') {
            const modalId = page === 'login' ? 'login-modal' : 'register-modal';
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        }
    }

    async initPage(page) {
        // Initialize appropriate module
        switch (page) {
            case 'dashboard':
                await window.dashboard.loadData();
                break;
            case 'documents':
                await window.documents.loadDocuments();
                break;
            case 'customers':
                await window.customers.loadCustomers();
                break;
            case 'products':
                await window.products.loadProducts();
                break;
            case 'admin-users':
            case 'admin-subscriptions':
            case 'admin-settings':
            case 'admin-logs':
                await window.admin.loadData();
                break;
        }
    }
}

// Main Application
class WorkViewApp {
    constructor() {
        this.router = new Router();
        this.isLoading = true;
    }

    async init() {
        // Show loading screen
        this.showLoadingScreen();

        // Initialize Firebase
        await this.initializeFirebase();

        // Load settings
        await this.loadSettings();

        // Load initial data
        await this.loadInitialData();

        // Initialize router
        this.router.init();

        // Initialize modules
        await this.initializeModules();

        // Hide loading screen
        this.hideLoadingScreen();

        // Set up event listeners
        this.setupEventListeners();

        // Check authentication state
        this.checkAuthState();
    }

    showLoadingScreen() {
        const loadingBar = document.getElementById('loading-bar');
        const loadingStatus = document.getElementById('loading-status');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            if (loadingBar) loadingBar.style.width = `${progress}%`;
        }, 200);

        this.loadingInterval = interval;
    }

    hideLoadingScreen() {
        const loadingBar = document.getElementById('loading-bar');
        const loadingStatus = document.getElementById('loading-status');
        
        // Complete loading
        if (loadingBar) loadingBar.style.width = '100%';
        if (loadingStatus) loadingStatus.textContent = 'Loading complete!';

        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 300);

        // Show app
        const app = document.getElementById('app');
        if (app) {
            app.classList.remove('hidden');
        }

        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
        }
    }

    async initializeFirebase() {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) statusEl.textContent = 'Connecting to Firebase...';

        const success = await window.firebaseService.initialize();
        
        if (!success) {
            console.warn('Firebase initialization failed, using demo mode');
        }
    }

    async loadSettings() {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) statusEl.textContent = 'Loading settings...';

        const settings = await window.firebaseService.getSettings();
        if (settings) {
            window.state.set('settings', settings);
        }
    }

    async loadInitialData() {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) statusEl.textContent = 'Loading data...';

        // Load demo data for testing
        await this.loadDemoData();
    }

    async loadDemoData() {
        // Check if user is logged in
        const user = window.state.get('user');
        if (!user) return;

        // In demo mode, load sample data
        // In production, this would fetch from Firebase
    }

    async initializeModules() {
        await window.dashboard.init();
        await window.documents.init();
        await window.customers.init();
        await window.products.init();
        await window.subscriptions.init();
        await window.pdf.init();
        await window.admin.init();
    }

    setupEventListeners() {
        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                document.querySelector('.nav-links')?.classList.toggle('active');
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
            el.addEventListener('click', () => {
                window.auth.closeModals();
            });
        });

        // Settings forms
        this.setupSettingsForms();

        // Letterhead upload
        this.setupLetterheadUpload();
    }

    setupSettingsForms() {
        // Business settings
        const businessForm = document.getElementById('business-settings-form');
        if (businessForm) {
            businessForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const settings = {
                    businessName: document.getElementById('business-name')?.value,
                    email: document.getElementById('business-email')?.value,
                    phone: document.getElementById('business-phone')?.value,
                    address: document.getElementById('business-address')?.value
                };

                const currentSettings = window.state.get('settings') || {};
                const newSettings = { ...currentSettings, ...settings };
                
                await window.firebaseService.saveSettings(newSettings);
                window.state.set('settings', newSettings);
                
                window.utils.showToast('Business settings saved!', 'success');
            });
        }

        // Branding settings
        const brandingForm = document.getElementById('branding-settings-form');
        if (brandingForm) {
            brandingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const brandColor = document.getElementById('brand-color')?.value;
                const brandColorText = document.getElementById('brand-color-text')?.value;
                
                const settings = {
                    brandColor: brandColorText || brandColor
                };

                const currentSettings = window.state.get('settings') || {};
                const newSettings = { ...currentSettings, ...settings };
                
                await window.firebaseService.saveSettings(newSettings);
                window.state.set('settings', newSettings);
                
                window.utils.showToast('Branding settings saved!', 'success');
            });

            // Color sync
            const colorInput = document.getElementById('brand-color');
            const colorText = document.getElementById('brand-color-text');
            
            if (colorInput && colorText) {
                colorInput.addEventListener('input', (e) => {
                    colorText.value = e.target.value;
                });
                colorText.addEventListener('input', (e) => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        colorInput.value = e.target.value;
                    }
                });
            }
        }

        // VAT settings
        const vatForm = document.getElementById('vat-settings-form');
        if (vatForm) {
            vatForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const vatRate = parseFloat(document.getElementById('vat-rate')?.value) || 15;
                
                const currentSettings = window.state.get('settings') || {};
                const newSettings = { ...currentSettings, vatRate };
                
                await window.firebaseService.saveSettings(newSettings);
                window.state.set('settings', newSettings);
                
                window.utils.showToast('Tax settings saved!', 'success');
            });
        }
    }

    setupLetterheadUpload() {
        const uploadArea = document.getElementById('letterhead-upload-area');
        const fileInput = document.getElementById('letterhead-upload');
        const removeBtn = document.getElementById('remove-letterhead');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', async (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                
                const file = e.dataTransfer.files[0];
                if (file) {
                    await this.uploadLetterhead(file);
                }
            });

            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await this.uploadLetterhead(file);
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', async () => {
                const settings = window.state.get('settings') || {};
                settings.letterheadUrl = '';
                await window.firebaseService.saveSettings(settings);
                window.state.set('settings', settings);
                
                document.getElementById('letterhead-preview').style.display = 'none';
                document.getElementById('letterhead-upload-area').style.display = 'block';
                
                window.utils.showToast('Letterhead removed', 'success');
            });
        }
    }

    async uploadLetterhead(file) {
        if (!file.type.startsWith('image/')) {
            window.utils.showToast('Please select an image file', 'error');
            return;
        }

        try {
            window.utils.showToast('Uploading letterhead...', 'info');
            
            const result = await window.firebaseService.uploadLetterhead(file);
            
            if (result.success) {
                const settings = window.state.get('settings') || {};
                settings.letterheadUrl = result.url;
                window.state.set('settings', settings);
                
                // Show preview
                const preview = document.getElementById('letterhead-preview');
                const previewImg = document.getElementById('letterhead-img');
                const uploadArea = document.getElementById('letterhead-upload-area');
                
                if (preview && previewImg) {
                    previewImg.src = result.url;
                    preview.style.display = 'block';
                    if (uploadArea) uploadArea.style.display = 'none';
                }
                
                window.utils.showToast('Letterhead uploaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Upload error:', error);
            window.utils.showToast('Failed to upload letterhead', 'error');
        }
    }

    checkAuthState() {
        const user = window.state.get('user');
        
        if (!user) {
            // Show login modal
            window.auth.showLoginModal();
        } else {
            // Navigate to dashboard
            this.router.navigate('dashboard');
        }
    }
}

// Create global instances
window.router = new Router();
window.app = new WorkViewApp();

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Start application
    await window.app.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        if (window.state.get('user')) {
            window.dashboard.loadData();
        }
    }
});