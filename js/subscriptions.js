// WorkView - Subscriptions Module
// Powered by MiraTech Industries

class SubscriptionsModule {
    constructor() {
        this.selectedPlan = null;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Monthly subscription button
        const monthlyBtn = document.getElementById('btn-monthly-subscribe');
        if (monthlyBtn) {
            monthlyBtn.addEventListener('click', () => this.selectPlan('monthly'));
        }

        // Yearly subscription button
        const yearlyBtn = document.getElementById('btn-yearly-subscribe');
        if (yearlyBtn) {
            yearlyBtn.addEventListener('click', () => this.selectPlan('yearly'));
        }

        // Payment form
        const paymentForm = document.getElementById('payment-form-inner');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePayment(e));
        }

        // Card number formatting
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        // Expiry formatting
        const expiry = document.getElementById('card-expiry');
        if (expiry) {
            expiry.addEventListener('input', (e) => this.formatExpiry(e));
        }

        // Manage subscription button
        const manageBtn = document.getElementById('btn-manage-subscription');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => window.auth.showSubscriptionModal());
        }
    }

    selectPlan(plan) {
        this.selectedPlan = plan;
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.style.display = 'block';
            
            // Scroll to payment form
            paymentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formattedValue += ' ';
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
    }

    formatExpiry(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        e.target.value = value;
    }

    async handlePayment(e) {
        e.preventDefault();

        if (!this.selectedPlan) {
            window.utils.showToast('Please select a plan first', 'error');
            return;
        }

        const cardName = document.getElementById('card-name')?.value;
        const cardNumber = document.getElementById('card-number')?.value;
        const cardExpiry = document.getElementById('card-expiry')?.value;
        const cardCvc = document.getElementById('card-cvc')?.value;

        // Validate card details
        if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
            window.utils.showToast('Please fill in all card details', 'error');
            return;
        }

        // Simulate payment processing
        window.utils.showToast('Processing payment...', 'info');
        
        try {
            const user = window.state.get('user');
            const result = await window.firebaseService.createSubscription(
                user.uid,
                this.selectedPlan,
                { cardNumber, cardName }
            );

            if (result.success) {
                window.utils.showToast('Payment successful! Your subscription is now active.', 'success');
                
                // Update local state
                const userData = window.state.get('userData');
                window.state.set('userData', {
                    ...userData,
                    subscriptionStatus: 'active',
                    subscriptionPlan: this.selectedPlan
                });

                // Refresh UI
                window.auth.updateUI();
                
                // Close modal
                window.auth.closeModals();
            } else {
                window.utils.showToast(result.error || 'Payment failed', 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            window.utils.showToast('Payment failed. Please try again.', 'error');
        }
    }

    updateSubscriptionBadge() {
        const userData = window.state.get('userData');
        const badge = document.getElementById('subscription-badge');
        const text = document.getElementById('subscription-text');

        if (userData?.subscriptionStatus === 'active' && badge && text) {
            badge.style.display = 'flex';
            
            if (userData.subscriptionPlan === 'yearly') {
                text.textContent = 'Yearly';
            } else if (userData.subscriptionPlan === 'monthly') {
                text.textContent = 'Monthly';
            }
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    getSubscriptionInfo() {
        const userData = window.state.get('userData');
        if (!userData) return null;

        return {
            status: userData.subscriptionStatus || 'inactive',
            plan: userData.subscriptionPlan || null,
            expiry: userData.subscriptionExpiry ? 
                new Date(userData.subscriptionExpiry.toDate()) : null
        };
    }

    isSubscriptionActive() {
        const subInfo = this.getSubscriptionInfo();
        if (!subInfo) return false;
        
        if (subInfo.status !== 'active') return false;
        if (!subInfo.expiry) return true;
        
        return subInfo.expiry > new Date();
    }
}

window.subscriptions = new SubscriptionsModule();