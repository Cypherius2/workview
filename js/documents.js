// WorkView - Documents Module
// Powered by MiraTech Industries

class DocumentsModule {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalPages = 1;
        this.filters = {
            search: '',
            type: '',
            status: ''
        };
    }

    async init() {
        this.setupEventListeners();
        await this.loadDocuments();
        this.setupFilters();
    }

    setupEventListeners() {
        // Create document button
        const createBtn = document.getElementById('btn-create-document');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showDocumentModal('invoice'));
        }

        // Add customer button
        const addCustomerBtn = document.getElementById('btn-add-customer-page');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => window.customers.showAddModal());
        }

        // Pagination
        const prevPage = document.getElementById('prev-page');
        const nextPage = document.getElementById('next-page');
        if (prevPage) {
            prevPage.addEventListener('click', () => this.changePage(-1));
        }
        if (nextPage) {
            nextPage.addEventListener('click', () => this.changePage(1));
        }

        // Document form
        const docForm = document.getElementById('document-form');
        if (docForm) {
            docForm.addEventListener('submit', (e) => this.handleDocumentSubmit(e));
        }

        // Cancel button
        const cancelBtn = document.getElementById('btn-cancel-document');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeDocumentModal());
        }

        // Add item button
        const addItemBtn = document.getElementById('btn-add-item');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addItemRow());
        }

        // Document type change
        const docType = document.getElementById('doc-type');
        if (docType) {
            docType.addEventListener('change', (e) => {
                const modalTitle = document.getElementById('document-modal-title');
                if (modalTitle) {
                    modalTitle.textContent = `Create ${window.utils.capitalize(e.target.value)}`;
                }
            });
        }

        // Item row changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-product')) {
                this.updateItemPrice(e.target);
            }
            if (e.target.classList.contains('item-qty') || e.target.classList.contains('item-price')) {
                this.updateItemAmount(e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-qty') || e.target.classList.contains('item-price')) {
                this.updateItemAmount(e.target);
            }
        });

        // Remove item button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-item')) {
                this.removeItemRow(e.target.closest('.item-row'));
            }
        });
    }

    setupFilters() {
        const searchInput = document.getElementById('documents-search');
        const typeFilter = document.getElementById('document-type-filter');
        const statusFilter = document.getElementById('document-status-filter');

        if (searchInput) {
            searchInput.addEventListener('input', 
                window.utils.debounce((e) => {
                    this.filters.search = e.target.value;
                    this.loadDocuments();
                }, 300)
            );
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.loadDocuments();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.loadDocuments();
            });
        }
    }

    async loadDocuments() {
        try {
            const documents = await window.firebaseService.getDocuments(this.filters);
            window.state.set('documents', documents);
            this.renderDocuments();
        } catch (error) {
            console.error('Error loading documents:', error);
            window.utils.showToast('Failed to load documents', 'error');
        }
    }

    renderDocuments() {
        const tbody = document.getElementById('documents-tbody');
        const documents = window.state.get('documents') || [];

        if (documents.length === 0) {
            tbody.innerHTML = `
                <tr class="table-empty">
                    <td colspan="7">
                        <i data-lucide="file-text"></i>
                        <p>No documents found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        // Paginate
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedDocs = documents.slice(start, end);
        this.totalPages = Math.ceil(documents.length / this.itemsPerPage);

        tbody.innerHTML = paginatedDocs.map(doc => `
            <tr>
                <td><strong>#${doc.documentNumber}</strong></td>
                <td><span class="doc-type-badge ${doc.type}">${window.utils.capitalize(doc.type)}</span></td>
                <td>${doc.customer?.name || 'N/A'}</td>
                <td>${window.utils.formatDate(doc.createdAt)}</td>
                <td><strong>${window.utils.formatCurrency(doc.totalAmount || 0)}</strong></td>
                <td><span class="status-badge ${doc.status}">${window.utils.capitalize(doc.status || 'pending')}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon btn-sm" onclick="window.documents.viewDocument('${doc.id}')" title="View">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="window.documents.downloadPDF('${doc.id}')" title="Download PDF">
                            <i data-lucide="download"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="window.documents.printDocument('${doc.id}')" title="Print">
                            <i data-lucide="printer"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
        this.updatePagination();
    }

    updatePagination() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const info = document.getElementById('pagination-info');

        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
        if (info) info.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }

    changePage(delta) {
        this.currentPage = Math.max(1, Math.min(this.totalPages, this.currentPage + delta));
        this.renderDocuments();
    }

    showDocumentModal(type = 'invoice') {
        const modal = document.getElementById('document-modal');
        const modalTitle = document.getElementById('document-modal-title');
        const docType = document.getElementById('doc-type');

        if (modalTitle) modalTitle.textContent = `Create ${window.utils.capitalize(type)}`;
        if (docType) docType.value = type;

        this.populateCustomerSelect();
        this.populateProductSelect();
        this.resetDocumentForm();
        
        if (modal) modal.classList.add('active');
    }

    closeDocumentModal() {
        const modal = document.getElementById('document-modal');
        if (modal) modal.classList.remove('active');
    }

    populateCustomerSelect() {
        const select = document.getElementById('doc-customer');
        const customers = window.state.get('customers') || [];

        if (select) {
            select.innerHTML = '<option value="">Select Customer</option>' +
                customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    }

    populateProductSelect() {
        const productSelects = document.querySelectorAll('.item-product');
        const products = window.state.get('products') || [];
        const options = '<option value="">Select Product</option>' +
            products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name}</option>`).join('');

        productSelects.forEach(select => {
            select.innerHTML = options;
        });
    }

    resetDocumentForm() {
        const form = document.getElementById('document-form');
        if (form) form.reset();

        // Reset items table
        const tbody = document.getElementById('items-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="item-row">
                    <td>
                        <select class="item-product" required>
                            <option value="">Select Product</option>
                        </select>
                    </td>
                    <td>
                        <input type="number" class="item-qty" value="1" min="1" required>
                    </td>
                    <td>
                        <input type="number" class="item-price" step="0.01" required>
                    </td>
                    <td class="item-amount">$0.00</td>
                    <td>
                        <button type="button" class="btn-icon btn-remove-item">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            this.populateProductSelect();
        }

        // Reset totals
        this.updateTotals();
    }

    addItemRow() {
        const tbody = document.getElementById('items-tbody');
        if (!tbody) return;

        const row = document.createElement('tr');
        row.className = 'item-row';
        row.innerHTML = `
            <td>
                <select class="item-product" required>
                    <option value="">Select Product</option>
                </select>
            </td>
            <td>
                <input type="number" class="item-qty" value="1" min="1" required>
            </td>
            <td>
                <input type="number" class="item-price" step="0.01" required>
            </td>
            <td class="item-amount">$0.00</td>
            <td>
                <button type="button" class="btn-icon btn-remove-item">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        lucide.createIcons();
        this.populateProductSelect();
    }

    removeItemRow(row) {
        const tbody = document.getElementById('items-tbody');
        if (tbody && tbody.children.length > 1) {
            row.remove();
            this.updateTotals();
        }
    }

    updateItemPrice(select) {
        const row = select.closest('.item-row');
        const priceInput = row.querySelector('.item-price');
        const selectedOption = select.options[select.selectedIndex];
        
        if (priceInput && selectedOption.dataset.price) {
            priceInput.value = selectedOption.dataset.price;
            this.updateItemAmount(priceInput);
        }
    }

    updateItemAmount(input) {
        const row = input.closest('.item-row');
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(input.value) || 0;
        const amountCell = row.querySelector('.item-amount');
        
        if (amountCell) {
            amountCell.textContent = window.utils.formatCurrency(qty * price);
        }

        this.updateTotals();
    }

    updateTotals() {
        const rows = document.querySelectorAll('.item-row');
        let subtotal = 0;

        rows.forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
            const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
            subtotal += qty * price;
        });

        const settings = window.state.get('settings') || {};
        const vatRate = settings.vatRate || 15;
        const vat = subtotal * (vatRate / 100);
        const total = subtotal + vat;

        document.getElementById('doc-subtotal').textContent = window.utils.formatCurrency(subtotal);
        document.getElementById('doc-vat').textContent = window.utils.formatCurrency(vat);
        document.getElementById('vat-rate-display').textContent = vatRate;
        document.getElementById('doc-total').textContent = window.utils.formatCurrency(total);
    }

    async handleDocumentSubmit(e) {
        e.preventDefault();

        const docType = document.getElementById('doc-type')?.value;
        const customerId = document.getElementById('doc-customer')?.value;
        const customer = window.state.get('customers')?.find(c => c.id === customerId);

        // Collect items
        const rows = document.querySelectorAll('.item-row');
        const items = [];

        rows.forEach(row => {
            const productSelect = row.querySelector('.item-product');
            const qty = parseInt(row.querySelector('.item-qty')?.value) || 0;
            const price = parseFloat(row.querySelector('.item-price')?.value) || 0;

            if (productSelect.value && qty > 0) {
                items.push({
                    productId: productSelect.value,
                    productName: productSelect.options[productSelect.selectedIndex].text,
                    quantity: qty,
                    price: price,
                    amount: qty * price
                });
            }
        });

        if (items.length === 0) {
            window.utils.showToast('Please add at least one item', 'error');
            return;
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const settings = window.state.get('settings') || {};
        const vatRate = settings.vatRate || 15;
        const vat = subtotal * (vatRate / 100);
        const total = subtotal + vat;

        const documentData = {
            documentNumber: window.utils.generateDocumentNumber(),
            type: docType,
            customer: customer || { name: 'Walk-in Customer' },
            items: items,
            subtotal: subtotal,
            vatRate: vatRate,
            vat: vat,
            totalAmount: total,
            status: docType === 'quotation' ? 'pending' : 'completed',
            businessName: settings.businessName || 'WorkView',
            letterheadUrl: settings.letterheadUrl || ''
        };

        try {
            const result = await window.firebaseService.createDocument(documentData);
            
            if (result.success) {
                window.utils.showToast(`${window.utils.capitalize(docType)} created successfully!`, 'success');
                
                // Update stock for invoices and receipts
                if (docType !== 'quotation') {
                    for (const item of items) {
                        await window.firebaseService.updateStock(item.productId, item.quantity);
                    }
                }

                this.closeDocumentModal();
                await this.loadDocuments();
                await window.dashboard.loadData();

                // Show success with download option
                this.showDownloadPrompt(result.id);
            } else {
                window.utils.showToast(result.error || 'Failed to create document', 'error');
            }
        } catch (error) {
            console.error('Document creation error:', error);
            window.utils.showToast('Failed to create document', 'error');
        }
    }

    async showDownloadPrompt(documentId) {
        // Could show a modal here with download/print options
    }

    async viewDocument(documentId) {
        const documents = window.state.get('documents') || [];
        const doc = documents.find(d => d.id === documentId);
        
        if (doc) {
            await window.pdf.previewDocument(doc);
        }
    }

    async downloadPDF(documentId) {
        const documents = window.state.get('documents') || [];
        const doc = documents.find(d => d.id === documentId);
        
        if (doc) {
            await window.pdf.downloadDocument(doc);
        }
    }

    async printDocument(documentId) {
        const documents = window.state.get('documents') || [];
        const doc = documents.find(d => d.id === documentId);
        
        if (doc) {
            await window.pdf.printDocument(doc);
        }
    }
}

// Create global instance
window.documents = new DocumentsModule();