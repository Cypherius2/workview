// WorkView - Dashboard Module
// Powered by MiraTech Industries

class DashboardModule {
    constructor() {
        this.chartInstances = {};
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

        // Quick action buttons
        const newInvoiceBtn = document.getElementById('btn-new-invoice');
        if (newInvoiceBtn) {
            newInvoiceBtn.addEventListener('click', () => window.router.navigate('documents'));
        }

        const newReceiptBtn = document.getElementById('btn-new-receipt');
        if (newReceiptBtn) {
            newReceiptBtn.addEventListener('click', () => window.router.navigate('documents'));
        }

        const newQuotationBtn = document.getElementById('btn-new-quotation');
        if (newQuotationBtn) {
            newQuotationBtn.addEventListener('click', () => window.router.navigate('documents'));
        }

        const addCustomerBtn = document.getElementById('btn-add-customer');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => window.customers.showAddModal());
        }
    }

    async loadData() {
        await Promise.all([
            this.loadStats(),
            this.loadRecentActivity(),
            this.loadCharts()
        ]);
    }

    async loadStats() {
        const documents = window.state.get('documents') || [];
        const customers = window.state.get('customers') || [];
        const products = window.state.get('products') || [];

        // Calculate total revenue
        const totalRevenue = documents
            .filter(d => d.type === 'invoice' || d.type === 'receipt')
            .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

        // Update DOM
        this.updateStat('stat-documents', documents.length);
        this.updateStat('stat-revenue', window.utils.formatCurrency(totalRevenue));
        this.updateStat('stat-customers', customers.length);
        this.updateStat('stat-products', products.length);
    }

    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    async loadRecentActivity() {
        const documents = window.state.get('documents') || [];
        const recentDocs = documents.slice(0, 5);
        const activityList = document.getElementById('activity-list');

        if (!activityList) return;

        if (recentDocs.length === 0) {
            activityList.innerHTML = `
                <div class="activity-empty">
                    <i data-lucide="inbox"></i>
                    <p>No recent activity</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        activityList.innerHTML = recentDocs.map(doc => `
            <div class="activity-item">
                <div class="activity-icon ${doc.type}">
                    <i data-lucide="${this.getDocIcon(doc.type)}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-title">${window.utils.capitalize(doc.type)} #${doc.documentNumber}</p>
                    <span class="activity-time">${window.utils.getRelativeTime(doc.createdAt)}</span>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    getDocIcon(type) {
        const icons = {
            invoice: 'file-text',
            receipt: 'receipt',
            quotation: 'clipboard-list'
        };
        return icons[type] || 'file-text';
    }

    async loadCharts() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            await this.loadChartJS();
        }

        this.renderRevenueChart();
        this.renderDocumentsChart();
    }

    async loadChartJS() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    renderRevenueChart() {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        // Get last 7 days revenue data
        const documents = window.state.get('documents') || [];
        const now = new Date();
        const labels = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const dayRevenue = documents
                .filter(d => {
                    const docDate = new Date(d.createdAt);
                    return docDate.toDateString() === date.toDateString() &&
                           (d.type === 'invoice' || d.type === 'receipt');
                })
                .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

            data.push(dayRevenue);
        }

        // Destroy existing chart
        if (this.chartInstances.revenue) {
            this.chartInstances.revenue.destroy();
        }

        this.chartInstances.revenue = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue',
                    data,
                    borderColor: '#1e90ff',
                    backgroundColor: 'rgba(30, 144, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    renderDocumentsChart() {
        const canvas = document.getElementById('documents-chart');
        if (!canvas) return;

        const documents = window.state.get('documents') || [];
        
        const invoiceCount = documents.filter(d => d.type === 'invoice').length;
        const receiptCount = documents.filter(d => d.type === 'receipt').length;
        const quotationCount = documents.filter(d => d.type === 'quotation').length;

        // Destroy existing chart
        if (this.chartInstances.documents) {
            this.chartInstances.documents.destroy();
        }

        this.chartInstances.documents = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Invoices', 'Receipts', 'Quotations'],
                datasets: [{
                    data: [invoiceCount, receiptCount, quotationCount],
                    backgroundColor: ['#1e90ff', '#38a169', '#d69e2e'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '60%'
            }
        });
    }
}

// Create global instance
window.dashboard = new DashboardModule();