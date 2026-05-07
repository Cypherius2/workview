// WorkView - Admin Module
// Powered by MiraTech Industries

class AdminModule {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
    }

    async init() {
        if (!window.auth.isAdmin()) {
            console.log('User is not an admin, hiding admin panel');
            return;
        }
        
        this.setupEventListeners();
        await this.loadData();
    }

    setupEventListeners() {
        // Add user button
        const addUserBtn = document.getElementById('btn-add-user');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }

        // Export logs button
        const exportLogsBtn = document.getElementById('btn-export-logs');
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', () => this.exportLogs());
        }

        // Settings forms
        const emailForm = document.getElementById('email-settings-form');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => this.saveEmailSettings(e));
        }

        const paymentForm = document.getElementById('payment-settings-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.savePaymentSettings(e));
        }
    }

    async loadData() {
        await Promise.all([
            this.loadUsers(),
            this.loadSubscriptions(),
            this.loadLogs()
        ]);
    }

    async loadUsers() {
        try {
            const users = await window.firebaseService.getUsers();
            window.state.set('users', users);
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsers() {
        const tbody = document.getElementById('users-tbody');
        const users = window.state.get('users') || [];

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr class="table-empty">
                    <td colspan="6">
                        <i data-lucide="users"></i>
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${window.utils.getInitials(user.displayName)}</div>
                        <span>${user.displayName || 'Unknown'}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <select class="role-select" onchange="window.admin.updateUserRole('${user.id}', this.value)">
                        <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Viewer</option>
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    <span class="access-badge level-${user.accessLevel || 1}">Level ${user.accessLevel || 1}</span>
                </td>
                <td>
                    <span class="status-badge ${user.subscriptionStatus || 'inactive'}">
                        ${user.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon btn-sm" onclick="window.admin.editUser('${user.id}')" title="Edit">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="window.admin.suspendUser('${user.id}')" title="Suspend">
                            <i data-lucide="slash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    }

    async loadSubscriptions() {
        try {
            const subscriptions = await window.firebaseService.getAllSubscriptions();
            window.state.set('subscriptions', subscriptions);
            
            // Calculate stats
            const now = new Date();
            const active = subscriptions.filter(s => s.status === 'completed');
            const expiringSoon = active.filter(s => {
                const expiry = s.expiryDate?.toDate ? s.expiryDate.toDate() : new Date(s.expiryDate);
                const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
                return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
            });
            const expired = active.filter(s => {
                const expiry = s.expiryDate?.toDate ? s.expiryDate.toDate() : new Date(s.expiryDate);
                return expiry < now;
            });

            this.updateStat('stat-subscribers', subscriptions.length);
            this.updateStat('stat-active-subs', active.length);
            this.updateStat('stat-expiring', expiringSoon.length);
            this.updateStat('stat-expired', expired.length);

            this.renderSubscriptions();
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    }

    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    renderSubscriptions() {
        const tbody = document.getElementById('subscriptions-tbody');
        const subscriptions = window.state.get('subscriptions') || [];

        if (subscriptions.length === 0) {
            tbody.innerHTML = `
                <tr class="table-empty">
                    <td colspan="6">
                        <i data-lucide="credit-card"></i>
                        <p>No subscriptions found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        tbody.innerHTML = subscriptions.map(sub => {
            const expiry = sub.expiryDate ? 
                (sub.expiryDate.toDate ? sub.expiryDate.toDate() : new Date(sub.expiryDate)) : 
                null;
            
            const isExpired = expiry && expiry < new Date();

            return `
                <tr>
                    <td>${sub.userEmail || 'Unknown'}</td>
                    <td><span class="plan-badge ${sub.plan}">${window.utils.capitalize(sub.plan || 'N/A')}</span></td>
                    <td>${window.utils.formatCurrency(sub.amount || 0)}</td>
                    <td>
                        <span class="status-badge ${sub.status}">${window.utils.capitalize(sub.status || 'pending')}</span>
                    </td>
                    <td>
                        ${expiry ? window.utils.formatDate(expiry) : 'N/A'}
                        ${isExpired ? '<span class="expired-tag">Expired</span>' : ''}
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon btn-sm" onclick="window.admin.renewSubscription('${sub.id}')" title="Renew">
                                <i data-lucide="refresh-cw"></i>
                            </button>
                            <button class="btn-icon btn-sm" onclick="window.admin.cancelSubscription('${sub.id}')" title="Cancel">
                                <i data-lucide="x-circle"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        lucide.createIcons();
    }

    async loadLogs() {
        // In production, fetch from Firestore
        // For demo, generate sample data
        const logs = [
            { timestamp: new Date(), userEmail: 'admin@example.com', action: 'login', details: 'User logged in', ipAddress: '192.168.1.1' },
            { timestamp: new Date(Date.now() - 3600000), userEmail: 'admin@example.com', action: 'create_document', details: 'Created invoice #WV-123', ipAddress: '192.168.1.1' }
        ];
        
        window.state.set('logs', logs);
        this.renderLogs();
    }

    renderLogs() {
        const tbody = document.getElementById('logs-tbody');
        const logs = window.state.get('logs') || [];

        if (logs.length === 0) {
            tbody.innerHTML = `
                <tr class="table-empty">
                    <td colspan="5">
                        <i data-lucide="activity"></i>
                        <p>No logs found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        tbody.innerHTML = logs.map(log => `
            <tr>
                <td class="font-mono">${window.utils.formatDateTime(log.timestamp)}</td>
                <td>${log.userEmail}</td>
                <td><span class="action-badge">${log.action}</span></td>
                <td>${log.details}</td>
                <td class="font-mono text-muted">${log.ipAddress}</td>
            </tr>
        `).join('');

        lucide.createIcons();
    }

    async updateUserRole(userId, newRole) {
        const accessLevels = { viewer: 1, user: 2, manager: 3, admin: 4 };
        
        try {
            await window.firebaseService.updateUserRole(userId, newRole, accessLevels[newRole] || 1);
            window.utils.showToast('User role updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating user role:', error);
            window.utils.showToast('Failed to update user role', 'error');
        }
    }

    editUser(userId) {
        window.utils.showToast('Edit user not implemented in demo', 'info');
    }

    suspendUser(userId) {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        window.utils.showToast('User suspended', 'success');
    }

    showAddUserModal() {
        window.utils.showToast('Add user modal not implemented in demo', 'info');
    }

    renewSubscription(subscriptionId) {
        window.utils.showToast('Renew subscription not implemented in demo', 'info');
    }

    cancelSubscription(subscriptionId) {
        if (!confirm('Are you sure you want to cancel this subscription?')) return;
        window.utils.showToast('Subscription cancelled', 'success');
    }

    async saveEmailSettings(e) {
        e.preventDefault();
        
        const settings = {
            resendApiKey: document.getElementById('resend-api-key')?.value,
            emailFrom: document.getElementById('email-from')?.value,
            emailFromName: document.getElementById('email-from-name')?.value
        };

        // In production, save to Firestore
        console.log('Email settings:', settings);
        window.utils.showToast('Email settings saved!', 'success');
    }

    async savePaymentSettings(e) {
        e.preventDefault();
        
        const settings = {
            stripeKey: document.getElementById('stripe-key')?.value,
            monthlyPrice: document.getElementById('monthly-price')?.value,
            yearlyPrice: document.getElementById('yearly-price')?.value
        };

        // In production, save to Firestore and update config
        console.log('Payment settings:', settings);
        window.utils.showToast('Payment settings saved!', 'success');
    }

    exportLogs() {
        const logs = window.state.get('logs') || [];
        if (logs.length === 0) {
            window.utils.showToast('No logs to export', 'info');
            return;
        }

        const data = logs.map(log => ({
            timestamp: window.utils.formatDateTime(log.timestamp),
            user: log.userEmail,
            action: log.action,
            details: log.details,
            ip: log.ipAddress
        }));

        window.utils.exportToCSV(data, 'activity_logs.csv');
        window.utils.showToast('Logs exported successfully', 'success');
    }
}

window.admin = new AdminModule();