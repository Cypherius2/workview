# WorkView - Comprehensive Specification

## 1. Project Overview

**Project Name:** WorkView  
**Type:** Enterprise Resource Management Platform (SaaS)  
**Powered By:** MiraTech Industries  
**Tagline:** "Innovating Today, Building Tomorrow"  

### Core Functionality
WorkView is a subscription-based business management platform that provides invoicing, quotation, receipt generation, and customer relationship management. It features a modern admin dashboard for access control, subscription management via MasterCard payments, and scalable architecture designed to handle over 1 million users.

### Target Users
- Small to medium businesses requiring document management
- Enterprises needing scalable business solutions
- Organizations requiring subscription-based access control

---

## 2. Visual Specification

### Color Palette (MiraTech Theme)
```css
/* Primary Colors */
--primary-navy: #0a1628;        /* Dark Navy - Primary Brand */
--primary-blue: #1e90ff;         /* Vibrant Blue - Accent */
--primary-blue-light: #4da6ff;   /* Light Blue - Hover States */

/* Secondary Colors */
--secondary-dark: #1a1f36;       /* Dark Background */
--secondary-gray: #2d3748;        /* Card Backgrounds */
--accent-gradient-start: #0a1628; /* Gradient Start */
--accent-gradient-end: #1e90ff;   /* Gradient End */

/* Neutral Colors */
--bg-primary: #f8fafc;          /* Light Background */
--bg-secondary: #ffffff;          /* Card Background */
--text-primary: #1a202c;          /* Primary Text */
--text-secondary: #718096;        /* Secondary Text */
--text-muted: #a0aec0;           /* Muted Text */
--border-color: #e2e8f0;          /* Borders */

/* Semantic Colors */
--success: #38a169;             /* Success States */
--warning: #d69e2e;             /* Warning States */
--error: #e53e3e;               /* Error States */
--info: #3182ce;                /* Info States */

/* Accent Gradient */
--gradient-primary: linear-gradient(135deg, #0a1628 0%, #1e90ff 100%);
```

### Typography
```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-secondary: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Outfit', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
```

### Loading Screen Design
- Full-screen overlay with MiraTech branding
- Animated logo with pulse effect
- Progress indicator with percentage
- Gradient background matching MiraTech theme
- Smooth fade-out transition when loading completes

---

## 3. Architecture Specification

### Frontend Architecture
- **Framework:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Single Page Application:** Client-side routing with hash-based navigation
- **State Management:** Custom reactive state management system
- **PDF Generation:** jsPDF library with custom templates

### Backend Architecture (Firebase)
- **Authentication:** Firebase Auth with email/password and Google OAuth
- **Database:** Cloud Firestore with structured collections
- **Storage:** Firebase Storage for letterhead images
- **Security:** Firebase Security Rules for data protection

### Database Schema

```javascript
// Collections Structure

// users - User accounts and subscription info
users/{userId}
  - email: string
  - displayName: string
  - role: 'admin' | 'user' | 'viewer'
  - subscriptionStatus: 'active' | 'inactive' | 'trial'
  - subscriptionPlan: 'monthly' | 'yearly'
  - subscriptionExpiry: timestamp
  - createdAt: timestamp
  - lastLogin: timestamp
  - companyId: string
  - accessLevel: number (1-5)
  - permissions: array

// companies - Organization settings
companies/{companyId}
  - name: string
  - email: string
  - phone: string
  - address: string
  - letterheadUrl: string (storage path)
  - brandColor: string
  - createdAt: timestamp
  - ownerId: string

// documents - Invoices, receipts, quotations
documents/{documentId}
  - documentNumber: string
  - type: 'invoice' | 'receipt' | 'quotation'
  - customerId: string
  - customer: object
  - items: array
  - subtotal: number
  - vat: number
  - totalAmount: number
  - status: 'pending' | 'completed' | 'cancelled'
  - createdAt: timestamp
  - companyId: string
  - pdfUrl: string

// customers - Customer database
customers/{customerId}
  - name: string
  - email: string
  - phone: string
  - address: string
  - createdAt: timestamp
  - companyId: string

// products - Product/Service catalog
products/{productId}
  - name: string
  - category: string
  - price: number
  - stock: number
  - imageUrl: string
  - createdAt: timestamp
  - companyId: string

// subscriptions - Payment records
subscriptions/{subscriptionId}
  - userId: string
  - plan: 'monthly' | 'yearly'
  - amount: number
  - currency: string
  - status: 'pending' | 'completed' | 'failed'
  - paymentMethod: string
  - transactionId: string
  - createdAt: timestamp
  - expiryDate: timestamp

// access_control - ACL rules
access_control/{ruleId}
  - roleId: string
  - resource: string
  - actions: array
  - conditions: object
  - createdAt: timestamp
```

---

## 4. Feature Specification

### 4.1 Loading Screen
- Duration: 2-3 seconds minimum, until app initialization complete
- MiraTech logo centered with animation
- Progress bar with percentage display
- Smooth opacity transition to main application

### 4.2 Authentication System
- Email/Password registration and login
- Google OAuth integration
- Password reset functionality
- Session management with Firebase Auth
- Remember me functionality

### 4.3 Admin Dashboard
**Access Control Features:**
- User management (create, edit, delete, suspend)
- Role management (Admin, User, Viewer)
- Access Level configuration (1-5 scale)
- Permission matrix
- Activity logs
- Session management

**Subscription Management:**
- View all subscriptions
- Plan modification
- Payment status tracking
- Expiry notifications
- Manual subscription override

**System Settings:**
- Company profile management
- Email configuration (Resend)
- Payment gateway settings
- API keys management
- Backup controls

### 4.4 User Dashboard
**Overview Panel:**
- Statistics cards (documents, customers, revenue)
- Recent activities
- Quick actions
- Subscription status indicator

**Document Management:**
- Create Invoice/Receipt/Quotation
- Document list with filters
- Search functionality
- Bulk actions
- Export to PDF

**Customer Management:**
- Customer list
- Add/Edit/Delete customers
- Customer details view
- Order history

**Product Management:**
- Product catalog
- Categories
- Stock levels
- Price management

### 4.5 PDF Generation (A4 Format)
**Document Structure:**
```
┌─────────────────────────────────────────┐
│           LETTERHEAD IMAGE              │
│         (User uploaded/logo)            │
├─────────────────────────────────────────┤
│                                         │
│   INVOICE / RECEIPT / QUOTATION         │
│                                         │
│   Document Number: #123456              │
│   Date: 08 May 2026                     │
│                                         │
│   Bill To:                              │
│   [Customer Details]                    │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │ Item    │ Qty │ Price │ Amount  │  │
│   │─────────│─────│───────│─────────│  │
│   │ Item 1  │  2  │ $50   │ $100    │  │
│   │ Item 2  │  1  │ $75   │ $75     │  │
│   └─────────────────────────────────┘  │
│                                         │
│   Subtotal:          $175.00            │
│   VAT (15%):          $26.25            │
│   ─────────────────────────────────     │
│   TOTAL:             $201.25            │
│                                         │
│   ─────────────────────────────────     │
│   Powered by MiraTech Industries        │
│   "Innovating Today, Building Tomorrow"│
└─────────────────────────────────────────┘
```

**Technical Specifications:**
- Paper Size: A4 (210mm x 297mm)
- Margins: 20mm all sides
- Font: Helvetica (built-in jsPDF)
- Logo placement: Top center, max height 40mm
- Color scheme: User's brand color

### 4.6 Subscription System
**Plans:**
- Monthly: $29.99/month
- Yearly: $299.99/year (Save ~17%)

**Features Included:**
- Unlimited documents
- Unlimited customers
- Unlimited products
- PDF generation
- Email support
- API access

**Payment Integration:**
- MasterCard integration (simulated for demo)
- Stripe-ready architecture
- Payment confirmation
- Invoice generation for payments

### 4.7 Access Control List (ACL)
**Permission Levels:**
1. Level 1 (Viewer): Read-only access to assigned resources
2. Level 2 (User): Create documents, view reports
3. Level 3 (Manager): Full document management, customer access
4. Level 4 (Admin): User management, settings access
5. Level 5 (Super Admin): Full system access

**Role-Based Permissions:**
- Admin: All permissions
- Manager: Document and customer management
- User: Create and view own documents
- Viewer: View-only access

### 4.8 Scalability Features
**Architecture Optimizations:**
- Firestore indexes for efficient queries
- Pagination for large datasets
- Lazy loading for content
- CDN for static assets
- Optimistic UI updates

**Database Optimization:**
- Collection group queries for cross-company data
- Denormalization for read-heavy operations
- Batch writes for bulk operations
- Caching strategies

---

## 5. Technical Dependencies

### External Libraries
```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>

<!-- PDF Generation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- Email (Resend) -->
<script src="https://cdn.jsdelivr.net/npm/@resend/node-client"></script>

<!-- Icons -->
<script src="https://unpkg.com/lucide@latest"></script>

<!-- Utilities -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

---

## 6. UI/UX Specifications

### Navigation Structure
```
┌─────────────────────────────────────────────────────────┐
│  WorkView Logo    │ Dashboard │ Documents │ Customers │
│                    │ Products  │ Settings  │ [Profile] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    MAIN CONTENT                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Admin Navigation
```
┌─────────────────────────────────────────────────────────┐
│  WorkView Admin    │ Users │ Subscriptions │ System    │
│                    │ Logs  │ Settings      │ [Profile] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    ADMIN CONTENT                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1440px

---

## 7. Security Specifications

### Authentication Security
- Firebase Auth with JWT tokens
- Session timeout after 30 minutes of inactivity
- Password requirements: 8+ chars, 1 uppercase, 1 number
- Rate limiting on login attempts

### Data Security
- Firestore security rules based on user role
- Data validation on all inputs
- XSS prevention with content sanitization
- CSRF protection

### API Security
- API key rotation
- Rate limiting
- Request validation

---

## 8. Performance Targets

### Load Time
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s

### Scalability
- Support for 1,000,000+ users
- Handle 10,000+ concurrent requests
- Database queries < 100ms
- PDF generation < 2s

---

## 9. Email Integration (Resend)

### Transactional Emails
- Welcome email on registration
- Subscription confirmation
- Payment receipts
- Document notifications
- Password reset

### Email Templates
- Clean HTML templates
- MiraTech branding
- Responsive design
- Plain text fallback

---

## 10. Deployment Specifications

### Hosting Requirements
- Firebase Hosting (recommended)
- Vercel/Netlify alternative
- Custom domain support
- SSL certificate (auto-provisioned)

### Environment Setup
- Firebase project configuration
- Resend API key
- Environment variables
- Build configuration

---

## 11. File Structure

```
workview/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main styles
│   ├── components.css      # Component styles
│   ├── dashboard.css       # Dashboard styles
│   └── admin.css           # Admin panel styles
├── js/
│   ├── app.js              # Main application
│   ├── router.js           # Client-side router
│   ├── state.js            # State management
│   ├── firebase.js         # Firebase configuration
│   ├── auth.js             # Authentication
│   ├── dashboard.js        # Dashboard module
│   ├── documents.js        # Document management
│   ├── customers.js        # Customer management
│   ├── products.js         # Product management
│   ├── admin.js            # Admin panel
│   ├── pdf.js              # PDF generation
│   ├── subscriptions.js    # Subscription management
│   └── utils.js            # Utility functions
├── assets/
│   ├── logo.svg            # MiraTech logo
│   └── images/             # Image assets
├── config/
│   └── firebase-config.js  # Firebase configuration
└── docs/
    ├── README.md           # Project documentation
    └── DEPLOY.md           # Deployment guide
```

---

## 12. Acceptance Criteria

### Core Functionality
- [ ] Loading screen displays MiraTech logo and completes smoothly
- [ ] User can register and login with email/password
- [ ] User can login with Google OAuth
- [ ] Dashboard displays statistics and recent activities
- [ ] User can create Invoice, Receipt, and Quotation
- [ ] PDF generation creates A4 formatted documents
- [ ] Custom letterhead appears on PDF documents
- [ ] Customer management (CRUD operations)
- [ ] Product management (CRUD operations)
- [ ] Admin can manage users and roles
- [ ] Subscription system works (monthly/yearly)
- [ ] Payment simulation works with MasterCard

### Technical Requirements
- [ ] No console errors in production
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All buttons and links are functional
- [ ] Form validation works correctly
- [ ] Error messages display appropriately
- [ ] Loading states display correctly

### Security
- [ ] Authentication required for all protected routes
- [ ] ACL enforced on all operations
- [ ] Input validation on all forms
- [ ] XSS prevention implemented

### Performance
- [ ] App loads within 3 seconds
- [ ] Navigation is instant
- [ ] PDF generation completes within 2 seconds
- [ ] Large lists paginate correctly