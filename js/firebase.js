// WorkView - Firebase Integration
// Powered by MiraTech Industries

class FirebaseService {
    constructor() {
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return true;

        try {
            // Wait for Firebase SDK to load
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }

            // Initialize Firebase
            const app = firebase.initializeApp(window.firebaseConfig);
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();

            // Enable offline persistence
            try {
                await this.db.enablePersistence({
                    synchronizeTabs: true
                });
            } catch (err) {
                if (err.code === 'unimplemented') {
                    console.log('Persistence not supported in this browser');
                }
            }

            // Set up auth state listener
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('User authenticated:', user.email);
                    window.state.set('user', user);
                    this.fetchUserData(user.uid);
                } else {
                    console.log('User signed out');
                    window.state.set('user', null);
                    window.state.set('userData', null);
                }
            });

            this.isInitialized = true;
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.showError('Failed to initialize Firebase');
            return false;
        }
    }

    async fetchUserData(userId) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                window.state.set('userData', userData);
                this.checkSubscription(userData);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    checkSubscription(userData) {
        const now = new Date();
        const expiry = userData.subscriptionExpiry ? userData.subscriptionExpiry.toDate() : null;
        
        if (!expiry || expiry < now) {
            window.state.set('subscriptionActive', false);
        } else {
            window.state.set('subscriptionActive', true);
        }
    }

    // Authentication Methods
    async signIn(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signUp(email, password, name, company) {
        try {
            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Create user document
            await this.db.collection('users').doc(result.user.uid).set({
                email: email,
                displayName: name,
                companyName: company,
                role: 'admin',
                accessLevel: 4,
                subscriptionStatus: 'inactive',
                subscriptionPlan: null,
                subscriptionExpiry: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Create company document
            await this.db.collection('companies').add({
                name: company,
                ownerId: result.user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, user: result.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            
            // Check if user exists, if not create new user
            const userDoc = await this.db.collection('users').doc(result.user.uid).get();
            if (!userDoc.exists) {
                await this.db.collection('users').doc(result.user.uid).set({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    role: 'user',
                    accessLevel: 2,
                    subscriptionStatus: 'inactive',
                    subscriptionPlan: null,
                    subscriptionExpiry: null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Update last login
                await this.db.collection('users').doc(result.user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Database Operations
    async getDocuments(filters = {}) {
        try {
            let query = this.db.collection('documents');
            
            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            
            query = query.orderBy('createdAt', 'desc');
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching documents:', error);
            return [];
        }
    }

    async createDocument(data) {
        try {
            const docRef = await this.db.collection('documents').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating document:', error);
            return { success: false, error: error.message };
        }
    }

    async getCustomers() {
        try {
            const snapshot = await this.db.collection('customers').orderBy('name').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

    async createCustomer(data) {
        try {
            const docRef = await this.db.collection('customers').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating customer:', error);
            return { success: false, error: error.message };
        }
    }

    async getProducts() {
        try {
            const snapshot = await this.db.collection('products').orderBy('name').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    async createProduct(data) {
        try {
            const docRef = await this.db.collection('products').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating product:', error);
            return { success: false, error: error.message };
        }
    }

    async updateStock(productId, quantity) {
        try {
            await this.db.collection('products').doc(productId).update({
                stock: firebase.firestore.FieldValue.increment(-quantity)
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating stock:', error);
            return { success: false, error: error.message };
        }
    }

    // Settings
    async getSettings() {
        try {
            const user = this.auth.currentUser;
            if (!user) return null;

            const doc = await this.db.collection('settings').doc(user.uid).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
    }

    async saveSettings(settings) {
        try {
            const user = this.auth.currentUser;
            if (!user) return { success: false, error: 'Not authenticated' };

            await this.db.collection('settings').doc(user.uid).set(settings, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error saving settings:', error);
            return { success: false, error: error.message };
        }
    }

    // Subscription
    async createSubscription(userId, plan, paymentDetails) {
        try {
            const planData = window.appConfig.plans[plan];
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + planData.duration);

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create subscription record
            const subRef = await this.db.collection('subscriptions').add({
                userId,
                plan,
                amount: planData.price,
                currency: planData.currency,
                status: 'completed',
                paymentMethod: 'mastercard',
                transactionId: 'txn_' + Date.now(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update user subscription status
            await this.db.collection('users').doc(userId).update({
                subscriptionStatus: 'active',
                subscriptionPlan: plan,
                subscriptionExpiry: expiryDate
            });

            return { success: true, subscriptionId: subRef.id };
        } catch (error) {
            console.error('Error creating subscription:', error);
            return { success: false, error: error.message };
        }
    }

    // Admin Methods
    async getUsers() {
        try {
            const snapshot = await this.db.collection('users').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    async updateUserRole(userId, role, accessLevel) {
        try {
            await this.db.collection('users').doc(userId).update({
                role,
                accessLevel
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user role:', error);
            return { success: false, error: error.message };
        }
    }

    async getAllSubscriptions() {
        try {
            const snapshot = await this.db.collection('subscriptions').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            return [];
        }
    }

    // File Upload
    async uploadLetterhead(file) {
        try {
            const user = this.auth.currentUser;
            if (!user) return { success: false, error: 'Not authenticated' };

            const storageRef = this.storage.ref(`letterheads/${user.uid}/${file.name}`);
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();

            // Save URL to settings
            await this.saveSettings({ letterheadUrl: url });

            return { success: true, url };
        } catch (error) {
            console.error('Error uploading letterhead:', error);
            return { success: false, error: error.message };
        }
    }

    // Activity Logs
    async logActivity(action, details) {
        try {
            const user = this.auth.currentUser;
            if (!user) return;

            await this.db.collection('activity_logs').add({
                userId: user.uid,
                userEmail: user.email,
                action,
                details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ipAddress: '127.0.0.1' // In production, get from server
            });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    showError(message) {
        window.utils.showToast(message, 'error');
    }
}

// Create global instance
window.firebaseService = new FirebaseService();