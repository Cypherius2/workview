// WorkView - PDF Generation Module
// Powered by MiraTech Industries

class PDFModule {
    constructor() {
        this.jsPDF = null;
        this.letterheadImage = null;
    }

    async init() {
        // Wait for jsPDF to load
        if (typeof jspdf !== 'undefined') {
            this.jsPDF = jspdf.jsPDF;
        } else {
            console.warn('jsPDF not loaded');
        }
    }

    async loadLetterhead(url) {
        if (!url) return null;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                this.letterheadImage = img;
                resolve(img);
            };
            img.onerror = () => {
                console.error('Failed to load letterhead image');
                resolve(null);
            };
            img.src = url;
        });
    }

    async generateDocument(doc) {
        if (!this.jsPDF) {
            await this.init();
        }

        // A4 dimensions in mm
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        // Create PDF
        const pdf = new this.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let yPos = margin;

        // Add letterhead if available
        const settings = window.state.get('settings') || {};
        if (settings.letterheadUrl) {
            await this.loadLetterhead(settings.letterheadUrl);
            
            if (this.letterheadImage) {
                const imgWidth = 170; // Full width minus margins
                const imgHeight = 40; // Fixed height for letterhead
                
                pdf.addImage(
                    this.letterheadImage,
                    'PNG',
                    margin,
                    yPos,
                    imgWidth,
                    imgHeight
                );
                
                yPos += imgHeight + 10;
            }
        } else {
            // Add default header
            yPos = await this.addDefaultHeader(pdf, doc, yPos, margin, contentWidth);
        }

        // Add separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Document info
        yPos = await this.addDocumentInfo(pdf, doc, yPos, margin);

        // Customer info
        yPos = await this.addCustomerInfo(pdf, doc, yPos, margin);

        // Items table
        yPos = await this.addItemsTable(pdf, doc, yPos, margin, contentWidth);

        // Totals
        yPos = await this.addTotals(pdf, doc, yPos, margin, contentWidth);

        // Footer
        this.addFooter(pdf, pageWidth, pageHeight, margin);

        return pdf;
    }

    async addDefaultHeader(pdf, doc, yPos, margin, contentWidth) {
        // Company logo placeholder
        pdf.setFillColor(26, 144, 255);
        pdf.rect(margin, yPos, 40, 30, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('WV', margin + 12, yPos + 18);

        // Company name
        const settings = window.state.get('settings') || {};
        pdf.setTextColor(26, 26, 40);
        pdf.setFontSize(14);
        pdf.text(settings.businessName || 'WorkView', margin + 50, yPos + 10);

        // Powered by MiraTech
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Powered by MiraTech Industries', margin + 50, yPos + 16);

        // Document type badge
        const badgeX = pageWidth - margin - 40;
        const badgeColors = {
            invoice: [30, 144, 255],
            receipt: [56, 161, 105],
            quotation: [214, 158, 46]
        };
        const color = badgeColors[doc.type] || badgeColors.invoice;
        
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.roundedRect(badgeX, yPos, 40, 12, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(doc.type?.toUpperCase() || 'INVOICE', badgeX + 7, yPos + 8);

        return yPos + 40;
    }

    async addDocumentInfo(pdf, doc, yPos, margin) {
        pdf.setTextColor(26, 26, 40);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        // Document number
        pdf.text(`Document #: ${doc.documentNumber || 'N/A'}`, margin, yPos);
        
        // Date
        const date = doc.createdAt ? 
            (doc.createdAt.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt)) : 
            new Date();
        
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Date: ${formattedDate}`, margin, yPos + 6);

        return yPos + 20;
    }

    async addCustomerInfo(pdf, doc, yPos, margin) {
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('BILL TO', margin, yPos);
        yPos += 5;

        pdf.setTextColor(26, 26, 40);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(doc.customer?.name || 'Walk-in Customer', margin, yPos);
        yPos += 5;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        if (doc.customer?.email) {
            pdf.text(doc.customer.email, margin, yPos);
            yPos += 4;
        }
        if (doc.customer?.phone) {
            pdf.text(doc.customer.phone, margin, yPos);
            yPos += 4;
        }
        if (doc.customer?.address) {
            pdf.text(doc.customer.address, margin, yPos);
            yPos += 4;
        }

        return yPos + 10;
    }

    async addItemsTable(pdf, doc, yPos, margin, contentWidth) {
        // Table header
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPos, contentWidth, 10, 'F');
        
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DESCRIPTION', margin + 2, yPos + 7);
        pdf.text('QTY', margin + 95, yPos + 7);
        pdf.text('PRICE', margin + 115, yPos + 7);
        pdf.text('AMOUNT', margin + 150, yPos + 7);
        
        yPos += 12;

        // Table rows
        pdf.setTextColor(26, 26, 40);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const items = doc.items || [];
        items.forEach((item, index) => {
            // Alternate row background
            if (index % 2 === 1) {
                pdf.setFillColor(248, 250, 252);
                pdf.rect(margin, yPos - 3, contentWidth, 10, 'F');
            }

            const description = item.productName || item.name || 'Item';
            const truncatedDesc = description.length > 35 ? description.substring(0, 35) + '...' : description;
            
            pdf.text(truncatedDesc, margin + 2, yPos + 3);
            pdf.text(item.quantity?.toString() || '0', margin + 95, yPos + 3);
            pdf.text(`$${(item.price || 0).toFixed(2)}`, margin + 115, yPos + 3);
            pdf.text(`$${(item.amount || (item.price * item.quantity)).toFixed(2)}`, margin + 150, yPos + 3);
            
            yPos += 10;
        });

        return yPos + 5;
    }

    async addTotals(pdf, doc, yPos, margin, contentWidth) {
        const subtotal = doc.subtotal || 0;
        const vatRate = doc.vatRate || 15;
        const vat = doc.vat || (subtotal * (vatRate / 100));
        const total = doc.totalAmount || (subtotal + vat);

        // Line separator
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin + 100, yPos, margin + contentWidth, yPos);
        yPos += 8;

        // Subtotal
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Subtotal', margin + 100, yPos);
        pdf.setTextColor(26, 26, 40);
        pdf.text(`$${subtotal.toFixed(2)}`, margin + 150, yPos);
        yPos += 7;

        // VAT
        pdf.setTextColor(128, 128, 128);
        pdf.text(`VAT (${vatRate}%)`, margin + 100, yPos);
        pdf.text(`$${vat.toFixed(2)}`, margin + 150, yPos);
        yPos += 10;

        // Total box
        pdf.setFillColor(26, 144, 255);
        pdf.roundedRect(margin + 90, yPos, contentWidth - 90, 15, 3, 3, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TOTAL', margin + 100, yPos + 10);
        pdf.text(`$${total.toFixed(2)}`, margin + 150, yPos + 10);

        return yPos + 25;
    }

    addFooter(pdf, pageWidth, pageHeight, margin) {
        const footerY = pageHeight - 20;
        
        // Line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        // Footer text
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
        pdf.text('Powered by MiraTech Industries', pageWidth / 2, footerY + 4, { align: 'center' });
        pdf.text('"Innovating Today, Building Tomorrow"', pageWidth / 2, footerY + 8, { align: 'center' });
    }

    async downloadDocument(doc) {
        try {
            window.utils.showToast('Generating PDF...', 'info');
            
            const pdf = await this.generateDocument(doc);
            const filename = `${doc.type}_${doc.documentNumber}.pdf`;
            
            pdf.save(filename);
            
            window.utils.showToast('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            window.utils.showToast('Failed to generate PDF', 'error');
        }
    }

    async previewDocument(doc) {
        try {
            const pdf = await this.generateDocument(doc);
            
            // Open in new window
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('PDF preview error:', error);
            window.utils.showToast('Failed to preview document', 'error');
        }
    }

    async printDocument(doc) {
        try {
            const pdf = await this.generateDocument(doc);
            
            // Print using browser
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            
            const printWindow = window.open(url);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            console.error('Print error:', error);
            window.utils.showToast('Failed to print document', 'error');
        }
    }
}

window.pdf = new PDFModule();