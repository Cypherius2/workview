// WorkView - Firebase Configuration
// Powered by MiraTech Industries

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Application Configuration
const appConfig = {
    name: 'WorkView',
    version: '1.0.0',
    poweredBy: 'MiraTech Industries',
    
    // Subscription Plans
    plans: {
        monthly: {
            name: 'Monthly',
            price: 29.99,
            duration: 30, // days
            currency: 'USD'
        },
        yearly: {
            name: 'Yearly',
            price: 299.99,
            duration: 365, // days
            currency: 'USD'
        }
    },
    
    // Access Levels
    accessLevels: {
        1: { name: 'Viewer', permissions: ['read'] },
        2: { name: 'User', permissions: ['read', 'create'] },
        3: { name: 'Manager', permissions: ['read', 'create', 'update'] },
        4: { name: 'Admin', permissions: ['read', 'create', 'update', 'delete'] },
        5: { name: 'Super Admin', permissions: ['read', 'create', 'update', 'delete', 'admin'] }
    },
    
    // Default Settings
    defaults: {
        vatRate: 15,
        brandColor: '#1e90ff',
        businessName: 'My Business',
        itemsPerPage: 20
    }
};

// Initialize Firebase
let app, auth, db, storage;

function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
    }
    
    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Enable Firestore persistence
        db.enablePersistence().catch((err) => {
            if (err.code === 'unimplemented') {
                console.log('Firestore persistence not supported in this browser');
            }
        });
        
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Export configuration
window.appConfig = appConfig;
window.initializeFirebase = initializeFirebase;
window.getFirebaseApp = () => app;
window.getAuth = () => auth;
window.getDb = () => db;
window.getStorage = () => storage;