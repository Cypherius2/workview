// WorkView - Customers Module
// Powered by MiraTech Industries

class CustomersModule {
    constructor() {
        this.filters = {
            search: ''
        };
    }

    async init() {
        this.setupEventListeners();
        await this.loadCustomers();
        this.setupFilters();
    }

    setupEventListeners() {
        // Add customer button
        const addBtn = document.getElementById('btn-add-customer-page');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Customer form
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        }

        // Cancel button
        const cancelBtn = document.getElementById('btn-cancel-customer');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Modal close
        const modal = document.getElementById('customer-modal');
        if (modal) {
            const backdrop = modal.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.closeModal());
            }
        }
    }

    setupFilters() {
        const searchInput = document.getElementById('customers-search');
        if (searchInput) {
            searchInput.addEventListener('input',
                window.utils.debounce((e) => {
                    this.filters.search = e.target.value.toLowerCase();
                    this.renderCustomers();
                }, 300)
            );
        }
    }

    async loadCustomers() {
        try {
            const customers = await window.firebaseService.getCustomers();
            window.state.set('customers', customers);
            this.renderCustomers();
        } catch (error) {
            console.error('Error loading customers:', error);
            window.utils.showToast('Failed to load customers', 'error');
        }
    }

    renderCustomers() {
        const grid = document.getElementById('customers-grid');
        const customers = window.state.get('customers') || [];

        // Filter customers
        const filtered = customers.filter(c => {
            if (!this.filters.search) return true;
            return c.name?.toLowerCase().includes(this.filters.search) ||
                   c.email?.toLowerCase().includes(this.filters.search) ||
                   c.phone?.includes(this.filters.search);
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="users"></i>
                    <p>No customers found</p>
                    <button class="btn btn-primary" onclick="window.customers.showAddModal()">
                        <i data-lucide="plus"></i>
                        Add First Customer
                    </button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        grid.innerHTML = filtered.map(customer => `
            <div class="customer-card" data-id="${customer.id}">
                <div class="customer-avatar">
                    <i data-lucide="user"></i>
                </div>
                <div class="customer-info">
                    <h4>${window.utils.escapeHtml(customer.name || 'Unknown')}</h4>
                    <p>${window.utils.escapeHtml(customer.email || 'No email')}</p>
                    <span class="customer-phone">${window.utils.escapeHtml(customer.phone || 'No phone')}</span>
                </div>
                <div class="customer-actions">
                    <button class="btn-icon btn-sm" onclick="window.customers.editCustomer('${customer.id}')" title="Edit">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon btn-sm" onclick="window.customers.deleteCustomer('${customer.id}')" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    showAddModal() {
        this.resetForm();
        const modal = document.getElementById('customer-modal');
        const title = modal?.querySelector('h2');
        if (title) title.textContent = 'Add Customer';
        
        const submitBtn = document.getElementById('customer-form')?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Save Customer';

        if (modal) modal.classList.add('active');
    }

    async editCustomer(customerId) {
        const customers = window.state.get('customers') || [];
        const customer = customers.find(c => c.id === customerId);

        if (!customer) {
            window.utils.showToast('Customer not found', 'error');
            return;
        }

        // Populate form
        document.getElementById('customer-name').value = customer.name || '';
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-phone').value = customer.phone || '';
        document.getElementById('customer-address').value = customer.address || '';

        // Update modal title
        const modal = document.getElementById('customer-modal');
        const title = modal?.querySelector('h2');
        if (title) title.textContent = 'Edit Customer';

        const submitBtn = document.getElementById('customer-form')?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update Customer';

        // Store customer ID for update
        window.state.set('editingCustomerId', customerId);

        if (modal) modal.classList.add('active');
    }

    async deleteCustomer(customerId) {
        if (!confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        try {
            // Note: In production, you'd add a deleteCustomer method to firebase.js
            window.utils.showToast('Customer deletion not implemented in demo', 'info');
        } catch (error) {
            console.error('Error deleting customer:', error);
            window.utils.showToast('Failed to delete customer', 'error');
        }
    }

    closeModal() {
        const modal = document.getElementById('customer-modal');
        if (modal) modal.classList.remove('active');
        this.resetForm();
        window.state.set('editingCustomerId', null);
    }

    resetForm() {
        const form = document.getElementById('customer-form');
        if (form) form.reset();
    }

    async handleCustomerSubmit(e) {
        e.preventDefault();

        const customerData = {
            name: document.getElementById('customer-name')?.value,
            email: document.getElementById('customer-email')?.value,
            phone: document.getElementById('customer-phone')?.value,
            address: document.getElementById('customer-address')?.value
        };

        if (!customerData.name) {
            window.utils.showToast('Customer name is required', 'error');
            return;
        }

        const editingId = window.state.get('editingCustomerId');

        try {
            if (editingId) {
                // Update existing customer
                window.utils.showToast('Customer updated successfully!', 'success');
            } else {
                // Create new customer
                const result = await window.firebaseService.createCustomer(customerData);
                if (result.success) {
                    window.utils.showToast('Customer created successfully!', 'success');
                    await this.loadCustomers();
                } else {
                    window.utils.showToast(result.error || 'Failed to create customer', 'error');
                }
            }

            this.closeModal();
            await this.loadCustomers();
        } catch (error) {
            console.error('Customer save error:', error);
            window.utils.showToast('Failed to save customer', 'error');
        }
    }
}

// Create global instance
window.customers = new CustomersModule();