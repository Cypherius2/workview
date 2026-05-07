# WorkView

**A Modern Business Management Platform**

*Powered by MiraTech Industries*  
*"Innovating Today, Building Tomorrow"*

---

## Overview

WorkView is a comprehensive, subscription-based business management platform designed for small to medium businesses. It provides a complete solution for managing invoices, quotations, receipts, customers, and products with an intuitive user interface and powerful administrative controls.

## Features

### Core Functionality

- **Dashboard**: Real-time business overview with statistics, charts, and recent activity
- **Document Management**: Create, view, and export invoices, receipts, and quotations
- **Customer Management**: Full CRUD operations for customer database
- **Product Management**: Product catalog with categories, pricing, and stock tracking
- **PDF Generation**: Professional A4 formatted documents with custom letterheads

### Admin Features

- **User Management**: Role-based access control with 5 permission levels
- **Subscription Management**: Monitor and manage user subscriptions
- **System Settings**: Configurable email (Resend), payment (MasterCard/Stripe), and Firebase settings
- **Activity Logs**: Track all system activities and user actions

### Subscription System

- **Monthly Plan**: $29.99/month
- **Yearly Plan**: $299.99/year (Save ~17%)
- **MasterCard Integration**: Secure payment processing
- **Subscription Status**: Active monitoring with expiry notifications

### Access Control List (ACL)

| Level | Role | Permissions |
|-------|------|-------------|
| 1 | Viewer | Read-only access |
| 2 | User | Create documents, view reports |
| 3 | Manager | Full document management, customer access |
| 4 | Admin | User management, settings access |
| 5 | Super Admin | Full system access |

## Technology Stack

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with CSS variables
- **JavaScript (ES6+)**: Vanilla JavaScript implementation
- **Lucide Icons**: Icon library
- **Chart.js**: Data visualization

### Backend (Firebase)
- **Firebase Authentication**: Email/password and Google OAuth
- **Cloud Firestore**: Real-time database
- **Firebase Storage**: File storage for letterheads

### External Services
- **jsPDF**: PDF generation
- **Resend**: Email service (configuration ready)
- **MasterCard**: Payment processing (simulated)

## Installation

### Prerequisites

- Node.js 18+ (for local development)
- Firebase project
- Resend account (optional, for email)

### Quick Start

1. **Clone or download the project**
   ```bash
   git clone https://github.com/your-repo/workview.git
   cd workview
   ```

2. **Configure Firebase**
   
   Edit `js/config.js` with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

3. **Open in Browser**
   
   Simply open `index.html` in a modern web browser.

### Firebase Setup

See [DEPLOY.md](./DEPLOY.md) for detailed Firebase configuration.

## Project Structure

```
workview/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Main styles
├── js/
│   ├── config.js           # Firebase and app configuration
│   ├── firebase.js         # Firebase service
│   ├── state.js            # State management
│   ├── utils.js            # Utility functions
│   ├── auth.js             # Authentication module
│   ├── dashboard.js        # Dashboard module
│   ├── documents.js        # Document management
│   ├── customers.js        # Customer management
│   ├── products.js         # Product management
│   ├── subscriptions.js    # Subscription handling
│   ├── pdf.js              # PDF generation
│   ├── admin.js            # Admin panel
│   └── app.js              # Main application
├── assets/
│   └── miratech-icon.svg   # MiraTech logo
├── SPEC.md                 # Technical specification
├── README.md               # This file
└── DEPLOY.md               # Deployment guide
```

## Configuration

### Firebase Configuration

Create a Firebase project and enable:
- Authentication (Email/Password + Google)
- Firestore Database
- Storage

### Environment Variables

Configure in `js/config.js`:

```javascript
const appConfig = {
    plans: {
        monthly: { price: 29.99, duration: 30 },
        yearly: { price: 299.99, duration: 365 }
    },
    defaults: {
        vatRate: 15,
        brandColor: '#1e90ff',
        businessName: 'My Business'
    }
};
```

### Resend Configuration

For email functionality, add your Resend API key in the admin settings panel.

## Database Schema

### Collections

**users**
```javascript
{
  email: string,
  displayName: string,
  role: 'admin' | 'user' | 'manager' | 'viewer',
  accessLevel: 1-5,
  subscriptionStatus: 'active' | 'inactive',
  subscriptionPlan: 'monthly' | 'yearly',
  subscriptionExpiry: timestamp
}
```

**documents**
```javascript
{
  documentNumber: string,
  type: 'invoice' | 'receipt' | 'quotation',
  customer: { name, email, phone, address },
  items: [{ productId, productName, quantity, price, amount }],
  subtotal: number,
  vat: number,
  totalAmount: number,
  status: 'pending' | 'completed' | 'cancelled',
  createdAt: timestamp
}
```

**customers**
```javascript
{
  name: string,
  email: string,
  phone: string,
  address: string,
  createdAt: timestamp
}
```

**products**
```javascript
{
  name: string,
  category: string,
  price: number,
  stock: number,
  imageUrl: string,
  createdAt: timestamp
}
```

**subscriptions**
```javascript
{
  userId: string,
  plan: 'monthly' | 'yearly',
  amount: number,
  status: 'pending' | 'completed' | 'failed',
  paymentMethod: string,
  transactionId: string,
  createdAt: timestamp,
  expiryDate: timestamp
}
```

**settings**
```javascript
{
  businessName: string,
  brandColor: string,
  vatRate: number,
  letterheadUrl: string
}
```

**activity_logs**
```javascript
{
  userId: string,
  userEmail: string,
  action: string,
  details: string,
  timestamp: timestamp,
  ipAddress: string
}
```

## Security

### Authentication
- Firebase Auth with JWT tokens
- Session timeout after 30 minutes of inactivity
- Password requirements: 8+ characters, 1 uppercase, 1 number

### Data Protection
- Firestore security rules based on user role
- Input validation on all forms
- XSS prevention with content sanitization

### API Security
- Rate limiting on API calls
- Request validation

## Scalability

WorkView is designed to scale for over 1 million users:

- **Firestore Indexes**: Optimized queries for efficient data retrieval
- **Pagination**: Automatic pagination for large datasets
- **Lazy Loading**: Content loaded on demand
- **CDN Support**: Static assets served from CDN
- **Optimistic UI**: Fast user interactions

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- PDF Generation: < 2s

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - See LICENSE file for details.

## Support

For support, email support@miratech.example.com or create an issue on GitHub.

## Credits

- **Powered by MiraTech Industries**
- **Tagline**: "Innovating Today, Building Tomorrow"

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-08