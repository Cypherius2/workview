# WorkView Deployment Guide

*Powered by MiraTech Industries*

---

## Overview

This guide provides detailed instructions for deploying WorkView, including Firebase setup, Resend email configuration, and production deployment steps.

## Prerequisites

- Node.js 18+
- Firebase account (Blaze plan recommended for production)
- Resend account (for email functionality)
- Git (optional)

---

## Part 1: Firebase Setup

### Step 1.1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "workview-app")
4. Configure Google Analytics (optional, recommended)
5. Click "Create project"

### Step 1.2: Enable Authentication

1. In the Firebase Console, go to **Authentication** > **Get started**
2. Enable the following providers:
   - **Email/Password**: Enable it and optionally enable "Email link (passwordless sign-in)"
   - **Google**: Enable it and configure the OAuth consent screen

### Step 1.3: Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose "Start in production mode" or "Start in test mode"
3. Select a location closest to your users
4. Click "Enable"

### Step 1.4: Configure Firestore Security Rules

Go to **Firestore** > **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.accessLevel >= 4;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
    }
    
    // Settings collection
    match /settings/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Documents collection
    match /documents/{documentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read, write: if isAuthenticated();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Activity logs
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // Companies collection
    match /companies/{companyId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### Step 1.5: Enable Storage

1. Go to **Storage** > **Get started**
2. Choose production or test mode
3. Configure security rules similar to Firestore

### Step 1.6: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > "Web"
4. Register your app with a nickname
5. Copy the Firebase configuration object

Example configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "workview-app.firebaseapp.com",
  projectId: "workview-app",
  storageBucket: "workview-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 1.7: Configure Firebase in WorkView

Edit `js/config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

## Part 2: Resend Email Setup

### Step 2.1: Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up for an account
3. Verify your domain or use their test domain

### Step 2.2: Get API Key

1. In Resend dashboard, go to **API Keys**
2. Create a new API key
3. Copy the API key (starts with `re_`)

### Step 2.3: Configure in WorkView

1. Log in to WorkView as Admin
2. Go to **System Settings** > **Email Configuration**
3. Enter:
   - **Resend API Key**: Your API key
   - **From Email**: Your verified email (e.g., noreply@yourdomain.com)
   - **From Name**: Your sender name (e.g., "WorkView")

### Step 2.4: Email Templates

WorkView supports these email notifications:
- Welcome email on registration
- Subscription confirmation
- Payment receipts
- Password reset

---

## Part 3: Deployment Options

### Option A: Firebase Hosting (Recommended)

#### Step 3A.1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 3A.2: Login to Firebase

```bash
firebase login
```

#### Step 3A.3: Initialize Firebase Hosting

```bash
firebase init hosting
```

Follow the prompts:
- Select your Firebase project
- Set public directory to `.` (current directory)
- Configure as single-page app: `No`
- Set up automatic builds: `No`

#### Step 3A.4: Deploy

```bash
firebase deploy
```

Your app will be available at `https://YOUR_PROJECT.web.app`

### Option B: Vercel

#### Step 3B.1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 3B.2: Deploy

```bash
vercel
```

Follow the prompts to configure your project.

### Option C: Netlify

#### Step 3C.1: Drag and Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop your `workview` folder
3. Your site will be live immediately

#### Step 3C.2: Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS records as instructed

### Option D: Traditional Web Hosting

1. Upload all files to your web server's public directory
2. Ensure your server supports HTML5 and JavaScript
3. Configure SSL/HTTPS for secure connections

---

## Part 4: Production Checklist

### Security Checklist

- [ ] Firebase Authentication enabled
- [ ] Firestore security rules configured
- [ ] Storage security rules configured
- [ ] CORS configured for Firebase Storage
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] API keys secured (not in frontend code for production)

### Performance Checklist

- [ ] Enable Firebase performance monitoring
- [ ] Set up CDN for static assets
- [ ] Configure browser caching
- [ ] Optimize images before upload
- [ ] Enable gzip compression

### Monitoring Checklist

- [ ] Set up Firebase Crashlytics
- [ ] Configure Analytics events
- [ ] Set up error reporting
- [ ] Create admin dashboards

---

## Part 5: Database Initialization

### Create Sample Data

For testing, you can add sample data to Firestore:

**Sample Company Settings:**
```javascript
// Collection: settings
// Document ID: USER_UID
{
  businessName: "Demo Company",
  brandColor: "#1e90ff",
  vatRate: 15,
  letterheadUrl: ""
}
```

**Sample Products:**
```javascript
// Collection: products
{
  name: "Sample Product",
  category: "Services",
  price: 99.99,
  stock: 100,
  createdAt: timestamp
}
```

### Create Indexes for Performance

In Firebase Console > Firestore > Indexes, add:

```
Collection: documents
Fields: type (Asc), createdAt (Desc)

Collection: products
Fields: category (Asc), name (Asc)
```

---

## Part 6: Troubleshooting

### Common Issues

**Firebase Connection Failed**
- Verify your API keys are correct
- Check that your domain is authorized in Firebase Console
- Ensure Firestore is enabled for your project

**Authentication Not Working**
- Check that Email/Password provider is enabled
- Verify your redirect domains in Firebase Console
- Check browser console for CORS errors

**PDF Not Generating**
- Ensure jsPDF library is loaded
- Check browser console for errors
- Verify user has permission to access documents

**Storage Upload Failed**
- Check Firebase Storage rules
- Verify user authentication
- Check file size limits (default 10MB)

### Debug Mode

Enable debug logging by adding to your code:

```javascript
firebase.auth().onAuthStateChanged((user) => {
  console.log('Auth state changed:', user);
});
```

### Get Help

If you encounter issues not covered here:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Check [WorkView Issues](https://github.com/your-repo/workview/issues)
3. Contact support: support@miratech.example.com

---

## Part 7: Updating Your Deployment

### Manual Update

1. Download the latest WorkView version
2. Replace your local files with the new version
3. Re-configure `js/config.js` with your Firebase settings
4. Redeploy to your hosting provider

### Git-based Update (if using Git)

```bash
git pull origin main
firebase deploy
```

---

## Part 8: Environment Configuration

### Environment Variables

For production, consider using environment variables:

```javascript
// js/config.js
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
```

### Build Configuration

For Vite/Webpack builds:

```javascript
// vite.config.js
export default defineConfig({
  define: {
    'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
    // ... other env vars
  }
});
```

---

## Quick Reference

### Firebase Console Links
- [Firebase Console](https://console.firebase.google.com/)
- [Authentication](https://console.firebase.google.com/project/_/authentication)
- [Firestore](https://console.firebase.google.com/project/_/firestore)
- [Storage](https://console.firebase.google.com/project/_/storage)
- [Hosting](https://console.firebase.google.com/project/_/hosting)

### Useful Commands

```bash
# Firebase CLI
firebase login
firebase init
firebase deploy
firebase emulators:start

# Check versions
firebase --version
node --version
npm --version
```

---

## Support

For deployment support:
- Email: support@miratech.example.com
- Documentation: [WorkView Docs](https://docs.workview.example.com)
- Issues: [GitHub Issues](https://github.com/your-repo/workview/issues)

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-08  
**Powered by MiraTech Industries**