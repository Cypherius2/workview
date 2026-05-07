// WorkView - Authentication Module
// Powered by MiraTech Industries

class AuthModule {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Listen for auth state changes
        window.state.on('user', (user) => {
            this.currentUser = user;
            this.updateUI();
        });
    }

    updateUI() {
        const user = window.state.get('user');
        const userData = window.state.get('userData');
        
        // Update user dropdown
        const userInfo = document.getElementById('user-info');
        if (user && userInfo) {
            userInfo.innerHTML = `
                <h4>${userData?.displayName || user.email}</h4>
                <p>${user.email}</p>
            `;
        }

        // Update subscription badge
        const badge = document.getElementById('subscription-badge');
        const subText = document.getElementById('subscription-text');
        if (userData?.subscriptionStatus === 'active') {
            if (badge) badge.style.display = 'flex';
            if (subText) subText.textContent = userData.subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly';
        } else {
            if (badge) badge.style.display = 'none';
        }

        // Show/hide admin navigation
        const adminNav = document.getElementById('admin-nav');
        if (userData?.accessLevel >= 4 && adminNav) {
            adminNav.style.display = 'flex';
        } else if (adminNav) {
            adminNav.style.display = 'none';
        }
    }

    async signIn(email, password) {
        try {
            window.utils.showToast('Signing in...', 'info');
            const result = await window.firebaseService.signIn(email, password);
            
            if (result.success) {
                window.utils.showToast('Welcome back!', 'success');
                window.router.navigate('dashboard');
                this.closeModals();
            } else {
                window.utils.showToast(result.error || 'Sign in failed', 'error');
            }
            
            return result;
        } catch (error) {
            console.error('Sign in error:', error);
            window.utils.showToast('Sign in failed', 'error');
            return { success: false, error: error.message };
        }
    }

    async signUp(name, email, password, company) {
        try {
            if (!window.utils.isValidPassword(password)) {
                window.utils.showToast('Password must be at least 8 characters', 'error');
                return { success: false, error: 'Password too short' };
            }

            window.utils.showToast('Creating account...', 'info');
            const result = await window.firebaseService.signUp(email, password, name, company);
            
            if (result.success) {
                window.utils.showToast('Account created! Please sign in.', 'success');
                this.showLoginModal();
            } else {
                window.utils.showToast(result.error || 'Sign up failed', 'error');
            }
            
            return result;
        } catch (error) {
            console.error('Sign up error:', error);
            window.utils.showToast('Sign up failed', 'error');
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        try {
            window.utils.showToast('Signing in with Google...', 'info');
            const result = await window.firebaseService.signInWithGoogle();
            
            if (result.success) {
                window.utils.showToast('Welcome!', 'success');
                window.router.navigate('dashboard');
                this.closeModals();
            } else {
                window.utils.showToast(result.error || 'Google sign in failed', 'error');
            }
            
            return result;
        } catch (error) {
            console.error('Google sign in error:', error);
            window.utils.showToast('Google sign in failed', 'error');
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const result = await window.firebaseService.signOut();
            
            if (result.success) {
                window.utils.showToast('Signed out successfully', 'success');
                window.state.clear();
                window.router.navigate('login');
            } else {
                window.utils.showToast('Sign out failed', 'error');
            }
            
            return result;
        } catch (error) {
            console.error('Sign out error:', error);
            window.utils.showToast('Sign out failed', 'error');
            return { success: false, error: error.message };
        }
    }

    showLoginModal() {
        this.closeModals();
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    showRegisterModal() {
        this.closeModals();
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    showSubscriptionModal() {
        this.closeModals();
        const modal = document.getElementById('subscription-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    isAuthenticated() {
        return window.state.get('user') !== null;
    }

    hasAccess(requiredLevel) {
        const userData = window.state.get('userData');
        return userData && userData.accessLevel >= requiredLevel;
    }

    isAdmin() {
        return this.hasAccess(4);
    }
}

// Create global instance
window.auth = new AuthModule();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await window.auth.signIn(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const company = document.getElementById('register-company').value;
            await window.auth.signUp(name, email, password, company);
        });
    }

    // Google login button
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            await window.auth.signInWithGoogle();
        });
    }

    // Show register link
    const showRegister = document.getElementById('show-register');
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            window.auth.showRegisterModal();
        });
    }

    // Show login link
    const showLogin = document.getElementById('show-login');
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            window.auth.showLoginModal();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.auth.signOut();
        });
    }

    // User menu toggle
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
});