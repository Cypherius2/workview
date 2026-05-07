// WorkView - Firebase Configuration
// Powered by MiraTech Industries
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCirLwM3DiIaUphgJ4l97vcK0uMXMogFTc",
  authDomain: "miratechindustries-workviewapp.firebaseapp.com",
  projectId: "miratechindustries-workviewapp",
  storageBucket: "miratechindustries-workviewapp.firebasestorage.app",
  messagingSenderId: "900820784952",
  appId: "1:900820784952:web:e777c69dfa0d47b47013cd",
  measurementId: "G-MWHLRQ4K1X"
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
