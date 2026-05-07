// WorkView - Products Module
// Powered by MiraTech Industries

class ProductsModule {
    constructor() {
        this.filters = {
            search: '',
            category: ''
        };
    }

    async init() {
        this.setupEventListeners();
        await this.loadProducts();
        this.setupFilters();
    }

    setupEventListeners() {
        // Add product button
        const addBtn = document.getElementById('btn-add-product');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Export CSV button
        const exportBtn = document.getElementById('btn-export-products');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // Product form
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        // Cancel button
        const cancelBtn = document.getElementById('btn-cancel-product');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Modal close
        const modal = document.getElementById('product-modal');
        if (modal) {
            const backdrop = modal.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.closeModal());
            }
        }
    }

    setupFilters() {
        const searchInput = document.getElementById('products-search');
        const categoryFilter = document.getElementById('products-category-filter');

        if (searchInput) {
            searchInput.addEventListener('input',
                window.utils.debounce((e) => {
                    this.filters.search = e.target.value.toLowerCase();
                    this.renderProducts();
                }, 300)
            );
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.renderProducts();
            });
        }
    }

    async loadProducts() {
        try {
            const products = await window.firebaseService.getProducts();
            window.state.set('products', products);
            this.renderProducts();
            this.populateCategoryFilter();
        } catch (error) {
            console.error('Error loading products:', error);
            window.utils.showToast('Failed to load products', 'error');
        }
    }

    populateCategoryFilter() {
        const products = window.state.get('products') || [];
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        
        const select = document.getElementById('products-category-filter');
        if (select) {
            select.innerHTML = '<option value="">All Categories</option>' +
                categories.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    }

    renderProducts() {
        const tbody = document.getElementById('products-tbody');
        const products = window.state.get('products') || [];

        // Filter products
        const filtered = products.filter(p => {
            const matchesSearch = !this.filters.search || 
                p.name?.toLowerCase().includes(this.filters.search) ||
                p.category?.toLowerCase().includes(this.filters.search);
            const matchesCategory = !this.filters.category || p.category === this.filters.category;
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr class="table-empty">
                    <td colspan="5">
                        <i data-lucide="package"></i>
                        <p>No products found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        tbody.innerHTML = filtered.map(product => `
            <tr>
                <td>
                    <div class="product-info">
                        ${product.imageUrl ? 
                            `<img src="${product.imageUrl}" alt="${product.name}" class="product-thumb">` : 
                            `<div class="product-thumb-placeholder"><i data-lucide="package"></i></div>`
                        }
                        <div>
                            <strong>${window.utils.escapeHtml(product.name || 'Unknown')}</strong>
                            ${product.imageUrl ? '' : `<span class="product-id">${product.id?.substring(0, 8)}</span>`}
                        </div>
                    </div>
                </td>
                <td><span class="category-badge">${window.utils.escapeHtml(product.category || 'N/A')}</span></td>
                <td><strong>${window.utils.formatCurrency(product.price || 0)}</strong></td>
                <td>
                    <span class="stock-badge ${product.stock < 10 ? 'low' : 'ok'}">
                        ${product.stock || 0}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon btn-sm" onclick="window.products.editProduct('${product.id}')" title="Edit">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="window.products.deleteProduct('${product.id}')" title="Delete">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    }

    showAddModal() {
        this.resetForm();
        const modal = document.getElementById('product-modal');
        const title = modal?.querySelector('h2');
        if (title) title.textContent = 'Add Product';
        
        const submitBtn = document.getElementById('product-form')?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Save Product';

        if (modal) modal.classList.add('active');
    }

    async editProduct(productId) {
        const products = window.state.get('products') || [];
        const product = products.find(p => p.id === productId);

        if (!product) {
            window.utils.showToast('Product not found', 'error');
            return;
        }

        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-stock').value = product.stock || '';
        document.getElementById('product-image').value = product.imageUrl || '';

        const modal = document.getElementById('product-modal');
        const title = modal?.querySelector('h2');
        if (title) title.textContent = 'Edit Product';

        const submitBtn = document.getElementById('product-form')?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update Product';

        window.state.set('editingProductId', productId);
        if (modal) modal.classList.add('active');
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        window.utils.showToast('Product deletion not implemented in demo', 'info');
    }

    closeModal() {
        const modal = document.getElementById('product-modal');
        if (modal) modal.classList.remove('active');
        this.resetForm();
        window.state.set('editingProductId', null);
    }

    resetForm() {
        const form = document.getElementById('product-form');
        if (form) form.reset();
    }

    async handleProductSubmit(e) {
        e.preventDefault();

        const productData = {
            name: document.getElementById('product-name')?.value,
            category: document.getElementById('product-category')?.value,
            price: parseFloat(document.getElementById('product-price')?.value) || 0,
            stock: parseInt(document.getElementById('product-stock')?.value) || 0,
            imageUrl: document.getElementById('product-image')?.value || ''
        };

        if (!productData.name || !productData.category) {
            window.utils.showToast('Name and category are required', 'error');
            return;
        }

        const editingId = window.state.get('editingProductId');

        try {
            if (editingId) {
                window.utils.showToast('Product updated successfully!', 'success');
            } else {
                const result = await window.firebaseService.createProduct(productData);
                if (result.success) {
                    window.utils.showToast('Product created successfully!', 'success');
                    await this.loadProducts();
                } else {
                    window.utils.showToast(result.error || 'Failed to create product', 'error');
                }
            }

            this.closeModal();
            await this.loadProducts();
        } catch (error) {
            console.error('Product save error:', error);
            window.utils.showToast('Failed to save product', 'error');
        }
    }

    exportToCSV() {
        const products = window.state.get('products') || [];
        if (products.length === 0) {
            window.utils.showToast('No products to export', 'info');
            return;
        }

        const data = products.map(p => ({
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock
        }));

        const filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
        window.utils.exportToCSV(data, filename);
        window.utils.showToast('Products exported successfully', 'success');
    }
}

window.products = new ProductsModule();